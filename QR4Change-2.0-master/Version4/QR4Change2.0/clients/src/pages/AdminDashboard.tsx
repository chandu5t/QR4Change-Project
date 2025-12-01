import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  MapPin,
  FileText,
  Filter,
  Download,
  Settings,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Complaint {
  id: string;
  title: string;
  type: string;
  city: string;
  department: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  date: string;
  priority: "High" | "Medium" | "Low";
  description: string;
  location: string;
  image: string;
  feedback: string;
}

interface CityData {
  city: string;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  level: "High" | "Moderate" | "Low";
}

const AdminDashboard = () => {
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsComplaintId, setDetailsComplaintId] = useState<string | null>(null);
  const [statusModalComplaintId, setStatusModalComplaintId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<"Pending" | "In Progress" | "Resolved" | "Rejected">("Pending");
  const [feedbackDraft, setFeedbackDraft] = useState<string>("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Department mapping
  const categoryToDepartment = {
    Garbage: "Sanitation Department",
    "Water Leakage": "Water Department",
    "Street Light": "Electricity Department",
    "Road Damage": "Road Department",
    Other: "General Admin",
  };

  // Normalize status
  const normalizeStatus = (status: string): Complaint["status"] => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Pending";
      case "in progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  // Derive stats and city data from complaints
  const [stats, cityData] = useMemo(() => {
    const stats = [
      { title: "Total Complaints", value: complaints.length.toLocaleString(), change: "+0%", icon: FileText, color: "text-blue-600" },
      {
        title: "Pending Review",
        value: complaints.filter(c => c.status === "Pending").length.toLocaleString(),
        change: "+0%",
        icon: Clock,
        color: "text-yellow-600",
      },
      {
        title: "In Progress",
        value: complaints.filter(c => c.status === "In Progress").length.toLocaleString(),
        change: "+0%",
        icon: TrendingUp,
        color: "text-blue-500",
      },
      {
        title: "Resolved",
        value: complaints.filter(c => c.status === "Resolved").length.toLocaleString(),
        change: "+0%",
        icon: CheckCircle2,
        color: "text-green-600",
      },
    ];

    const cities = [...new Set(complaints.map(c => c.city))];
    const cityData: CityData[] = cities.map(city => {
      const cityComplaints = complaints.filter(c => c.city === city);
      const total = cityComplaints.length;
      const pending = cityComplaints.filter(c => c.status === "Pending").length;
      const inProgress = cityComplaints.filter(c => c.status === "In Progress").length;
      const resolved = cityComplaints.filter(c => c.status === "Resolved").length;
      const level = total > 2000 ? "High" : total > 1000 ? "Moderate" : "Low";
      return { city, total, pending, inProgress, resolved, level };
    });

    return [stats, cityData];
  }, [complaints]);

  const cityLatLng: Record<string, [number, number]> = {
    "New Delhi": [28.6139, 77.2090],
    Mumbai: [19.0760, 72.8777],
    Bangalore: [12.9716, 77.5946],
    Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639],
    Pune: [18.5204, 73.8567],
  };

  const maxTotal = useMemo(() => Math.max(...cityData.map(c => c.total), 1), [cityData]);

  const heatmapPoints = useMemo(() => {
    return cityData
      .map(c => {
        const pos = cityLatLng[c.city];
        if (!pos) return null;
        const intensity = Math.min(c.total / maxTotal, 1); // Normalize intensity between 0 and 1
        return [...pos, intensity] as [number, number, number];
      })
      .filter((p): p is [number, number, number] => p !== null);
  }, [cityData, maxTotal]);

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard.",
          variant: "destructive",
        });
        navigate("/admin-login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/authority/complaints", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(response.status === 401 ? "Unauthorized access" : "Failed to fetch complaints");
        }

        const { complaints } = await response.json();

        const mappedComplaints: Complaint[] = complaints.map((c: any) => ({
          id: c._id,
          title: c.title,
          type: c.category,
          city: c.city,
          department: categoryToDepartment[c.category] || "General Admin",
          status: normalizeStatus(c.status),
          date: new Date(c.createdAt).toISOString().split("T")[0],
          priority: c.urgency || "Medium",
          description: c.description,
          location: c.location,
          image: c.image,
          feedback: c.feedback || "",
        }));

        setComplaints(mappedComplaints);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load complaints.",
          variant: "destructive",
        });
        if (err.message === "Unauthorized access") {
          navigate("/admin-login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-600";
      case "Moderate":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Heatmap image state and controls
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string>("");
  const [heatmapUrlInput, setHeatmapUrlInput] = useState<string>("");
  const [heatmapZoom, setHeatmapZoom] = useState<number>(1);
  const applyHeatmapUrl = () => setHeatmapImageUrl(heatmapUrlInput.trim());
  const onHeatmapFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setHeatmapImageUrl(objectUrl);
  };
  const zoomIn = () => setHeatmapZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setHeatmapZoom((z) => Math.max(0.5, z - 0.25));
  const zoomReset = () => setHeatmapZoom(1);

  const filteredComplaints = useMemo(() => {
    const cityMap: Record<string, string> = {
      delhi: "New Delhi",
      mumbai: "Mumbai",
      bangalore: "Bangalore",
      chennai: "Chennai",
    };
    const statusMap: Record<string, string> = {
      pending: "Pending",
      progress: "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
    };
    return complaints.filter((c) => {
      const cityOk = selectedCity === "all" || c.city === cityMap[selectedCity];
      const deptOk = selectedDepartment === "all" || c.department.toLowerCase().includes(selectedDepartment.toLowerCase());
      const statusOk = selectedStatus === "all" || c.status === statusMap[selectedStatus];
      const q = searchQuery.trim().toLowerCase();
      const searchOk =
        q.length === 0 ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      return cityOk && deptOk && statusOk && searchOk;
    });
  }, [complaints, selectedCity, selectedDepartment, selectedStatus, searchQuery]);

  const handleExportCsv = () => {
    const headers = ["ID", "Title", "Type", "City", "Department", "Status", "Date", "Priority", "Description", "Location", "Feedback"];
    const rows = filteredComplaints.map(c => [
      c.id,
      c.title,
      c.type,
      c.city,
      c.department,
      c.status,
      c.date,
      c.priority,
      c.description,
      c.location,
      c.feedback,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openStatusModal = (
    id: string,
    currentStatus: "Pending" | "In Progress" | "Resolved" | "Rejected",
    currentFeedback: string
  ) => {
    setStatusModalComplaintId(id);
    setStatusDraft(currentStatus);
    setFeedbackDraft(currentFeedback);
  };

  const applyStatusUpdate = async () => {
    if (!statusModalComplaintId) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      navigate("/admin-login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/authority/complaint/${statusModalComplaintId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusDraft.toLowerCase(), feedback: feedbackDraft }),
      });

      if (!response.ok) {
        throw new Error(response.status === 403 ? "Unauthorized to update this complaint" : "Failed to update complaint");
      }

      const { complaint } = await response.json();
      setComplaints(prev =>
        prev.map(c =>
          c.id === statusModalComplaintId
            ? {
                ...c,
                status: normalizeStatus(complaint.status),
                feedback: complaint.feedback || "",
              }
            : c
        )
      );
      toast({
        title: "Success",
        description: "Complaint status and feedback updated successfully.",
      });
      setStatusModalComplaintId(null);
      setFeedbackDraft("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update complaint.",
        variant: "destructive",
      });
    }
  };

  const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
    const map = useMap();

    useEffect(() => {
      const heatLayer = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        minOpacity: 0.3,
        gradient: {
          0.2: 'green',
          0.5: 'yellow',
          0.8: 'orange',
          1.0: 'red',
        },
      });
      map.addLayer(heatLayer);

      return () => {
        map.removeLayer(heatLayer);
      };
    }, [map, points]);

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Manage and monitor civic complaints across all cities</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm" onClick={() => alert("Settings coming soon")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-600">
                        <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
                          {stat.change}
                        </span>{" "}
                        from last month
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="complaints" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="complaints">Complaints Management</TabsTrigger>
              <TabsTrigger value="analytics">City Analytics</TabsTrigger>
              <TabsTrigger value="heatmap">Complaint Heatmap</TabsTrigger>
            </TabsList>

            {/* Complaints Management */}
            <TabsContent value="complaints" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Cities</SelectItem>
                          {[...new Set(complaints.map(c => c.city))].map(city => (
                            <SelectItem key={city} value={city.toLowerCase()}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Department</label>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="sanitation">Sanitation</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="electricity">Electricity</SelectItem>
                          <SelectItem value="road">Road</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                        <Input
                          placeholder="Search complaints..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Complaints Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Latest complaints submitted across all cities</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <p className="text-center text-gray-600">No complaints found.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredComplaints.map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{complaint.title}</h4>
                              <p className="text-sm text-gray-600">ID: {complaint.id}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                              <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="font-medium">{complaint.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">City:</span>
                              <p className="font-medium">{complaint.city}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Department:</span>
                              <p className="font-medium">{complaint.department}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p className="font-medium">{complaint.date}</p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setDetailsComplaintId(complaint.id)}>
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openStatusModal(complaint.id, complaint.status, complaint.feedback)}
                            >
                              Update Status
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* City Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>City-wise Complaint Analysis</span>
                  </CardTitle>
                  <CardDescription>Complaint statistics across major cities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cityData.map((city, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-600" />
                            <div>
                              <h4 className="font-medium">{city.city}</h4>
                              <p className="text-sm text-gray-600">Total: {city.total} complaints</p>
                            </div>
                          </div>
                          <Badge className={`${getLevelColor(city.level)}`} variant="outline">
                            {city.level} Activity
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-2 bg-yellow-100 rounded">
                            <p className="font-medium text-yellow-800">{city.pending}</p>
                            <p className="text-gray-600">Pending</p>
                          </div>
                          <div className="text-center p-2 bg-blue-100 rounded">
                            <p className="font-medium text-blue-800">{city.inProgress}</p>
                            <p className="text-gray-600">In Progress</p>
                          </div>
                          <div className="text-center p-2 bg-green-100 rounded">
                            <p className="font-medium text-green-800">{city.resolved}</p>
                            <p className="text-gray-600">Resolved</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Heatmap */}
            <TabsContent value="heatmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Complaint Density Heatmap</span>
                  </CardTitle>
                  <CardDescription>Interactive heatmap on India's map showing complaint density by city. You can also upload a custom heatmap image.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Interactive Heatmap on Map */}
                    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
                      <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {heatmapPoints.length > 0 && <HeatmapLayer points={heatmapPoints} />}
                      </MapContainer>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-2">
                      Heatmap showing complaint density by city (hotter colors indicate higher density)
                    </p>

                    {/* Controls for Custom Image */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        {/* <Input
                          placeholder="Paste heatmap image URL"
                          value={heatmapUrlInput}
                          onChange={(e) => setHeatmapUrlInput(e.target.value)}
                        />
                        <Button variant="outline" onClick={applyHeatmapUrl}>
                          Apply
                        </Button> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="heatmapFile" type="file" accept="image/*" className="hidden" onChange={onHeatmapFile} />
                        {/* <Button variant="outline" onClick={() => document.getElementById("heatmapFile")?.click()}>
                          Upload Image
                        </Button> */}
                        <Button variant="outline" onClick={zoomOut}>
                          -
                        </Button>
                        <Button variant="outline" onClick={zoomReset}>
                          100%
                        </Button>
                        <Button variant="outline" onClick={zoomIn}>
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">Low</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm">Moderate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">High</span>
                      </div>
                    </div>

                    {/* Optional custom heatmap image */}
                    {heatmapImageUrl && (
                      <div className="w-full bg-gray-100 rounded-lg border overflow-hidden">
                        <div className="w-full h-[420px] md:h-[520px] overflow-auto">
                          <img
                            src={heatmapImageUrl}
                            alt="Custom Complaint Density Heatmap"
                            className="block mx-auto select-none"
                            style={{ transform: `scale(${heatmapZoom})`, transformOrigin: "center center" }}
                            draggable={false}
                          />
                        </div>
                      </div>
                    )}

                    {heatmapImageUrl && (
                      <p className="text-center text-sm text-gray-600">
                        Zoom with the controls above. Upload or paste a different image URL to replace.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Details Modal */}
          {detailsComplaintId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg border max-h-[80vh] overflow-y-auto relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setDetailsComplaintId(null)}
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Complaint Details</h3>
                  <p className="text-sm text-gray-600 mb-4">ID: {detailsComplaintId}</p>
                  {(() => {
                    const complaint = complaints.find(c => c.id === detailsComplaintId);
                    if (!complaint) return <p className="text-sm text-red-600">Complaint not found</p>;
                    return (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Title</p>
                          <p className="text-sm text-gray-600">{complaint.title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-gray-600">{complaint.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-gray-600">{complaint.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Type</p>
                          <p className="text-sm text-gray-600">{complaint.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">City</p>
                          <p className="text-sm text-gray-600">{complaint.city}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-sm text-gray-600">{complaint.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Priority</p>
                          <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Date Submitted</p>
                          <p className="text-sm text-gray-600">{complaint.date}</p>
                        </div>
                        {complaint.image && (
                          <div>
                            <p className="text-sm font-medium">Photo Evidence</p>
                            <img
                              src={complaint.image}
                              alt="Complaint evidence"
                              className="max-w-full h-auto rounded-lg mt-2"
                            />
                          </div>
                        )}
                        {complaint.feedback && (
                          <div>
                            <p className="text-sm font-medium">Feedback</p>
                            <p className="text-sm text-gray-600">{complaint.feedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setDetailsComplaintId(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Status Modal */}
          {statusModalComplaintId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md border max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Update Complaint</h3>
                  <p className="text-sm text-gray-600">ID: {statusModalComplaintId}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={statusDraft}
                      onValueChange={(v) => setStatusDraft(v as "Pending" | "In Progress" | "Resolved" | "Rejected")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback</label>
                    <Textarea
                      value={feedbackDraft}
                      onChange={(e) => setFeedbackDraft(e.target.value)}
                      placeholder="Enter feedback or updates..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusModalComplaintId(null);
                      setFeedbackDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={applyStatusUpdate}>Update</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
// import { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import {
//   BarChart3,
//   MapPin,
//   FileText,
//   Filter,
//   Download,
//   Settings,
//   Search,
//   TrendingUp,
//   Clock,
//   CheckCircle2,
//   X,
// } from "lucide-react";
// import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import 'leaflet.heat';

// // Fix Leaflet default icon issue
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// interface Complaint {
//   id: string;
//   title: string;
//   type: string;
//   city: string;
//   department: string;
//   status: "Pending" | "In Progress" | "Resolved" | "Rejected";
//   date: string;
//   priority: "High" | "Medium" | "Low";
//   description: string;
//   location: string;
//   image: string;
//   feedback: string;
// }

// interface CityData {
//   city: string;
//   total: number;
//   pending: number;
//   inProgress: number;
//   resolved: number;
//   level: "High" | "Moderate" | "Low";
// }

// const AdminDashboard = () => {
//   const [selectedCity, setSelectedCity] = useState("all");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [detailsComplaintId, setDetailsComplaintId] = useState<string | null>(null);
//   const [statusModalComplaintId, setStatusModalComplaintId] = useState<string | null>(null);
//   const [statusDraft, setStatusDraft] = useState<"Pending" | "In Progress" | "Resolved" | "Rejected">("Pending");
//   const [feedbackDraft, setFeedbackDraft] = useState<string>("");
//   const [complaints, setComplaints] = useState<Complaint[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // Department mapping
//   const categoryToDepartment = {
//     Garbage: "Sanitation Department",
//     "Water Leakage": "Water Department",
//     "Street Light": "Electricity Department",
//     "Road Damage": "Road Department",
//     Other: "General Admin",
//   };

//   // Normalize status
//   const normalizeStatus = (status: string): Complaint["status"] => {
//     switch (status.toLowerCase()) {
//       case "pending":
//         return "Pending";
//       case "in progress":
//         return "In Progress";
//       case "resolved":
//         return "Resolved";
//       case "rejected":
//         return "Rejected";
//       default:
//         return "Pending";
//     }
//   };

//   // Derive stats and city data from complaints
//   const [stats, cityData] = useMemo(() => {
//     const stats = [
//       { title: "Total Complaints", value: complaints.length.toLocaleString(), change: "+0%", icon: FileText, color: "text-primary" },
//       {
//         title: "Pending Review",
//         value: complaints.filter(c => c.status === "Pending").length.toLocaleString(),
//         change: "+0%",
//         icon: Clock,
//         color: "text-warning",
//       },
//       {
//         title: "In Progress",
//         value: complaints.filter(c => c.status === "In Progress").length.toLocaleString(),
//         change: "+0%",
//         icon: TrendingUp,
//         color: "text-accent",
//       },
//       {
//         title: "Resolved",
//         value: complaints.filter(c => c.status === "Resolved").length.toLocaleString(),
//         change: "+0%",
//         icon: CheckCircle2,
//         color: "text-success",
//       },
//     ];

//     const cities = [...new Set(complaints.map(c => c.city))];
//     const cityData: CityData[] = cities.map(city => {
//       const cityComplaints = complaints.filter(c => c.city === city);
//       const total = cityComplaints.length;
//       const pending = cityComplaints.filter(c => c.status === "Pending").length;
//       const inProgress = cityComplaints.filter(c => c.status === "In Progress").length;
//       const resolved = cityComplaints.filter(c => c.status === "Resolved").length;
//       const level = total > 2000 ? "High" : total > 1000 ? "Moderate" : "Low";
//       return { city, total, pending, inProgress, resolved, level };
//     });

//     return [stats, cityData];
//   }, [complaints]);

//   const cityLatLng: Record<string, [number, number]> = {
//     "New Delhi": [28.6139, 77.2090],
//     Mumbai: [19.0760, 72.8777],
//     Bangalore: [12.9716, 77.5946],
//     Chennai: [13.0827, 80.2707],
//     Kolkata: [22.5726, 88.3639],
//     Pune: [18.5204, 73.8567],
//   };

//   const maxTotal = useMemo(() => Math.max(...cityData.map(c => c.total), 1), [cityData]);

//   const heatmapPoints = useMemo(() => {
//     return cityData
//       .map(c => {
//         const pos = cityLatLng[c.city];
//         if (!pos) return null;
//         const intensity = Math.min(c.total / maxTotal, 1); // Normalize intensity between 0 and 1
//         return [...pos, intensity] as [number, number, number];
//       })
//       .filter((p): p is [number, number, number] => p !== null);
//   }, [cityData, maxTotal]);

//   // Fetch complaints on mount
//   useEffect(() => {
//     const fetchComplaints = async () => {
//       const token = localStorage.getItem("adminToken");
//       if (!token) {
//         toast({
//           title: "Authentication Required",
//           description: "Please log in to access the dashboard.",
//           variant: "destructive",
//         });
//         navigate("/admin-login");
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:5000/api/authority/complaints", {
//           method: "GET",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(response.status === 401 ? "Unauthorized access" : "Failed to fetch complaints");
//         }

//         const { complaints } = await response.json();

//         const mappedComplaints: Complaint[] = complaints.map((c: any) => ({
//           id: c._id,
//           title: c.title,
//           type: c.category,
//           city: c.city,
//           department: categoryToDepartment[c.category] || "General Admin",
//           status: normalizeStatus(c.status),
//           date: new Date(c.createdAt).toISOString().split("T")[0],
//           priority: c.urgency || "Medium",
//           description: c.description,
//           location: c.location,
//           image: c.image,
//           feedback: c.feedback || "",
//         }));

//         setComplaints(mappedComplaints);
//       } catch (err: any) {
//         toast({
//           title: "Error",
//           description: err.message || "Failed to load complaints.",
//           variant: "destructive",
//         });
//         if (err.message === "Unauthorized access") {
//           navigate("/admin-login");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, [navigate, toast]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "In Progress":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "Resolved":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "Rejected":
//         return "bg-red-100 text-red-800 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "High":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "Medium":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "Low":
//         return "bg-green-100 text-green-800 border-green-200";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case "High":
//         return "text-red-600";
//       case "Moderate":
//         return "text-yellow-600";
//       case "Low":
//         return "text-green-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   // Heatmap image state and controls
//   const [heatmapImageUrl, setHeatmapImageUrl] = useState<string>("");
//   const [heatmapUrlInput, setHeatmapUrlInput] = useState<string>("");
//   const [heatmapZoom, setHeatmapZoom] = useState<number>(1);
//   const applyHeatmapUrl = () => setHeatmapImageUrl(heatmapUrlInput.trim());
//   const onHeatmapFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const objectUrl = URL.createObjectURL(file);
//     setHeatmapImageUrl(objectUrl);
//   };
//   const zoomIn = () => setHeatmapZoom((z) => Math.min(3, z + 0.25));
//   const zoomOut = () => setHeatmapZoom((z) => Math.max(0.5, z - 0.25));
//   const zoomReset = () => setHeatmapZoom(1);

//   const filteredComplaints = useMemo(() => {
//     const cityMap: Record<string, string> = {
//       delhi: "New Delhi",
//       mumbai: "Mumbai",
//       bangalore: "Bangalore",
//       chennai: "Chennai",
//     };
//     const statusMap: Record<string, string> = {
//       pending: "Pending",
//       progress: "In Progress",
//       resolved: "Resolved",
//       rejected: "Rejected",
//     };
//     return complaints.filter((c) => {
//       const cityOk = selectedCity === "all" || c.city === cityMap[selectedCity];
//       const deptOk = selectedDepartment === "all" || c.department.toLowerCase().includes(selectedDepartment.toLowerCase());
//       const statusOk = selectedStatus === "all" || c.status === statusMap[selectedStatus];
//       const q = searchQuery.trim().toLowerCase();
//       const searchOk =
//         q.length === 0 ||
//         c.id.toLowerCase().includes(q) ||
//         c.title.toLowerCase().includes(q) ||
//         c.type.toLowerCase().includes(q) ||
//         c.city.toLowerCase().includes(q) ||
//         c.department.toLowerCase().includes(q);
//       return cityOk && deptOk && statusOk && searchOk;
//     });
//   }, [complaints, selectedCity, selectedDepartment, selectedStatus, searchQuery]);

//   const handleExportCsv = () => {
//     const headers = ["ID", "Title", "Type", "City", "Department", "Status", "Date", "Priority", "Description", "Location", "Feedback"];
//     const rows = filteredComplaints.map(c => [
//       c.id,
//       c.title,
//       c.type,
//       c.city,
//       c.department,
//       c.status,
//       c.date,
//       c.priority,
//       c.description,
//       c.location,
//       c.feedback,
//     ]);
//     const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "complaints_export.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const openStatusModal = (
//     id: string,
//     currentStatus: "Pending" | "In Progress" | "Resolved" | "Rejected",
//     currentFeedback: string
//   ) => {
//     setStatusModalComplaintId(id);
//     setStatusDraft(currentStatus);
//     setFeedbackDraft(currentFeedback);
//   };

//   const applyStatusUpdate = async () => {
//     if (!statusModalComplaintId) return;

//     const token = localStorage.getItem("adminToken");
//     if (!token) {
//       toast({
//         title: "Authentication Error",
//         description: "Please log in again.",
//         variant: "destructive",
//       });
//       navigate("/admin-login");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/api/authority/complaint/${statusModalComplaintId}`, {
//         method: "PUT",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: statusDraft.toLowerCase(), feedback: feedbackDraft }),
//       });

//       if (!response.ok) {
//         throw new Error(response.status === 403 ? "Unauthorized to update this complaint" : "Failed to update complaint");
//       }

//       const { complaint } = await response.json();
//       setComplaints(prev =>
//         prev.map(c =>
//           c.id === statusModalComplaintId
//             ? {
//                 ...c,
//                 status: normalizeStatus(complaint.status),
//                 feedback: complaint.feedback || "",
//               }
//             : c
//         )
//       );
//       toast({
//         title: "Success",
//         description: "Complaint status and feedback updated successfully.",
//       });
//       setStatusModalComplaintId(null);
//       setFeedbackDraft("");
//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err.message || "Failed to update complaint.",
//         variant: "destructive",
//       });
//     }
//   };

//   const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
//     const map = useMap();

//     useEffect(() => {
//       const heatLayer = (L as any).heatLayer(points, {
//         radius: 25,
//         blur: 15,
//         maxZoom: 17,
//         minOpacity: 0.3,
//         gradient: {
//           0.2: 'green',
//           0.5: 'yellow',
//           0.8: 'orange',
//           1.0: 'red',
//         },
//       });
//       map.addLayer(heatLayer);

//       return () => {
//         map.removeLayer(heatLayer);
//       };
//     }, [map, points]);

//     return null;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
//       <div className="container mx-auto px-4">
//         <div className="space-y-8">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
//             <div>
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//               <p className="text-gray-600">Manage and monitor civic complaints across all cities</p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button variant="outline" size="sm" onClick={handleExportCsv}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Export Data
//               </Button>
//               <Button size="sm" onClick={() => alert("Settings coming soon")}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Settings
//               </Button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, index) => (
//               <Card key={index}>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                       <p className="text-2xl font-bold">{stat.value}</p>
//                       <p className="text-xs text-gray-600">
//                         <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>
//                           {stat.change}
//                         </span>{" "}
//                         from last month
//                       </p>
//                     </div>
//                     <stat.icon className={`h-8 w-8 ${stat.color}`} />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Main Content */}
//           <Tabs defaultValue="complaints" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="complaints">Complaints Management</TabsTrigger>
//               <TabsTrigger value="analytics">City Analytics</TabsTrigger>
//               <TabsTrigger value="heatmap">Complaint Heatmap</TabsTrigger>
//             </TabsList>

//             {/* Complaints Management */}
//             <TabsContent value="complaints" className="space-y-6">
//               {/* Filters */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <Filter className="h-5 w-5" />
//                     <span>Filters</span>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">City</label>
//                       <Select value={selectedCity} onValueChange={setSelectedCity}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select city" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Cities</SelectItem>
//                           {[...new Set(complaints.map(c => c.city))].map(city => (
//                             <SelectItem key={city} value={city.toLowerCase()}>
//                               {city}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Department</label>
//                       <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select department" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Departments</SelectItem>
//                           <SelectItem value="sanitation">Sanitation</SelectItem>
//                           <SelectItem value="water">Water</SelectItem>
//                           <SelectItem value="electricity">Electricity</SelectItem>
//                           <SelectItem value="road">Road</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Status</label>
//                       <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Status</SelectItem>
//                           <SelectItem value="pending">Pending</SelectItem>
//                           <SelectItem value="progress">In Progress</SelectItem>
//                           <SelectItem value="resolved">Resolved</SelectItem>
//                           <SelectItem value="rejected">Rejected</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Search</label>
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
//                         <Input
//                           placeholder="Search complaints..."
//                           className="pl-10"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Complaints Table */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Complaints</CardTitle>
//                   <CardDescription>Latest complaints submitted across all cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {isLoading ? (
//                     <div className="flex justify-center items-center py-8">
//                       <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
//                     </div>
//                   ) : filteredComplaints.length === 0 ? (
//                     <p className="text-center text-gray-600">No complaints found.</p>
//                   ) : (
//                     <div className="space-y-4">
//                       {filteredComplaints.map((complaint) => (
//                         <div key={complaint.id} className="border rounded-lg p-4 space-y-3">
//                           <div className="flex items-start justify-between">
//                             <div className="space-y-1">
//                               <h4 className="font-medium">{complaint.title}</h4>
//                               <p className="text-sm text-gray-600">ID: {complaint.id}</p>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                               <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                               <span className="text-gray-600">Type:</span>
//                               <p className="font-medium">{complaint.type}</p>
//                             </div>
//                             <div>
//                               <span className="text-gray-600">City:</span>
//                               <p className="font-medium">{complaint.city}</p>
//                             </div>
//                             <div>
//                               <span className="text-gray-600">Department:</span>
//                               <p className="font-medium">{complaint.department}</p>
//                             </div>
//                             <div>
//                               <span className="text-gray-600">Date:</span>
//                               <p className="font-medium">{complaint.date}</p>
//                             </div>
//                           </div>
//                           <div className="flex justify-end space-x-2">
//                             <Button variant="outline" size="sm" onClick={() => setDetailsComplaintId(complaint.id)}>
//                               View Details
//                             </Button>
//                             <Button
//                               size="sm"
//                               onClick={() => openStatusModal(complaint.id, complaint.status, complaint.feedback)}
//                             >
//                               Update Status
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* City Analytics */}
//             <TabsContent value="analytics" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <BarChart3 className="h-5 w-5" />
//                     <span>City-wise Complaint Analysis</span>
//                   </CardTitle>
//                   <CardDescription>Complaint statistics across major cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {cityData.map((city, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-3">
//                             <MapPin className="h-5 w-5 text-gray-600" />
//                             <div>
//                               <h4 className="font-medium">{city.city}</h4>
//                               <p className="text-sm text-gray-600">Total: {city.total} complaints</p>
//                             </div>
//                           </div>
//                           <Badge className={`${getLevelColor(city.level)}`} variant="outline">
//                             {city.level} Activity
//                           </Badge>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div className="text-center p-2 bg-yellow-100 rounded">
//                             <p className="font-medium text-yellow-800">{city.pending}</p>
//                             <p className="text-gray-600">Pending</p>
//                           </div>
//                           <div className="text-center p-2 bg-blue-100 rounded">
//                             <p className="font-medium text-blue-800">{city.inProgress}</p>
//                             <p className="text-gray-600">In Progress</p>
//                           </div>
//                           <div className="text-center p-2 bg-green-100 rounded">
//                             <p className="font-medium text-green-800">{city.resolved}</p>
//                             <p className="text-gray-600">Resolved</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Heatmap */}
//             <TabsContent value="heatmap" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <MapPin className="h-5 w-5" />
//                     <span>Complaint Density Heatmap</span>
//                   </CardTitle>
//                   <CardDescription>Interactive heatmap on India's map showing complaint density by city. You can also upload a custom heatmap image.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* Interactive Heatmap on Map */}
//                     <div className="w-full h-[500px] rounded-lg overflow-hidden border">
//                       <MapContainer
//                         center={[20.5937, 78.9629]}
//                         zoom={5}
//                         style={{ height: '100%', width: '100%' }}
//                         scrollWheelZoom={true}
//                       >
//                         <TileLayer
//                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         />
//                         {heatmapPoints.length > 0 && <HeatmapLayer points={heatmapPoints} />}
//                       </MapContainer>
//                     </div>
//                     <p className="text-center text-xs text-gray-600 mt-2">
//                       Heatmap showing complaint density by city (hotter colors indicate higher density)
//                     </p>

//                     {/* Controls for Custom Image */}
//                     <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
//                       <div className="flex-1 flex items-center gap-2">
//                         <Input
//                           placeholder="Paste heatmap image URL"
//                           value={heatmapUrlInput}
//                           onChange={(e) => setHeatmapUrlInput(e.target.value)}
//                         />
//                         <Button variant="outline" onClick={applyHeatmapUrl}>
//                           Apply
//                         </Button>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input id="heatmapFile" type="file" accept="image/*" className="hidden" onChange={onHeatmapFile} />
//                         <Button variant="outline" onClick={() => document.getElementById("heatmapFile")?.click()}>
//                           Upload Image
//                         </Button>
//                         <Button variant="outline" onClick={zoomOut}>
//                           -
//                         </Button>
//                         <Button variant="outline" onClick={zoomReset}>
//                           100%
//                         </Button>
//                         <Button variant="outline" onClick={zoomIn}>
//                           +
//                         </Button>
//                       </div>
//                     </div>

//                     {/* Legend */}
//                     <div className="flex items-center justify-center space-x-6">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-green-500 rounded"></div>
//                         <span className="text-sm">Low</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-yellow-500 rounded"></div>
//                         <span className="text-sm">Moderate</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-red-500 rounded"></div>
//                         <span className="text-sm">High</span>
//                       </div>
//                     </div>

//                     {/* Optional custom heatmap image */}
//                     {heatmapImageUrl && (
//                       <div className="w-full bg-gray-100 rounded-lg border overflow-hidden">
//                         <div className="w-full h-[420px] md:h-[520px] overflow-auto">
//                           <img
//                             src={heatmapImageUrl}
//                             alt="Custom Complaint Density Heatmap"
//                             className="block mx-auto select-none"
//                             style={{ transform: `scale(${heatmapZoom})`, transformOrigin: "center center" }}
//                             draggable={false}
//                           />
//                         </div>
//                       </div>
//                     )}

//                     {heatmapImageUrl && (
//                       <p className="text-center text-sm text-gray-600">
//                         Zoom with the controls above. Upload or paste a different image URL to replace.
//                       </p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Details Modal */}
//           {detailsComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//               <div className="bg-white rounded-lg shadow-lg w-full max-w-lg border max-h-[80vh] overflow-y-auto relative">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="absolute top-2 right-2"
//                   onClick={() => setDetailsComplaintId(null)}
//                   aria-label="Close modal"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold mb-2">Complaint Details</h3>
//                   <p className="text-sm text-gray-600 mb-4">ID: {detailsComplaintId}</p>
//                   {(() => {
//                     const complaint = complaints.find(c => c.id === detailsComplaintId);
//                     if (!complaint) return <p className="text-sm text-red-600">Complaint not found</p>;
//                     return (
//                       <div className="space-y-4">
//                         <div>
//                           <p className="text-sm font-medium">Title</p>
//                           <p className="text-sm text-gray-600">{complaint.title}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Description</p>
//                           <p className="text-sm text-gray-600">{complaint.description}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Location</p>
//                           <p className="text-sm text-gray-600">{complaint.location}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Type</p>
//                           <p className="text-sm text-gray-600">{complaint.type}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">City</p>
//                           <p className="text-sm text-gray-600">{complaint.city}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Department</p>
//                           <p className="text-sm text-gray-600">{complaint.department}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Status</p>
//                           <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Priority</p>
//                           <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Date Submitted</p>
//                           <p className="text-sm text-gray-600">{complaint.date}</p>
//                         </div>
//                         {complaint.image && (
//                           <div>
//                             <p className="text-sm font-medium">Photo Evidence</p>
//                             <img
//                               src={complaint.image}
//                               alt="Complaint evidence"
//                               className="max-w-full h-auto rounded-lg mt-2"
//                             />
//                           </div>
//                         )}
//                         {complaint.feedback && (
//                           <div>
//                             <p className="text-sm font-medium">Feedback</p>
//                             <p className="text-sm text-gray-600">{complaint.feedback}</p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })()}
//                   <div className="flex justify-end gap-2 mt-6">
//                     <Button variant="outline" onClick={() => setDetailsComplaintId(null)}>
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Update Status Modal */}
//           {statusModalComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//               <div className="bg-white rounded-lg shadow-lg w-full max-w-md border max-h-[80vh] overflow-y-auto">
//                 <div className="p-4 border-b">
//                   <h3 className="text-lg font-semibold">Update Complaint</h3>
//                   <p className="text-sm text-gray-600">ID: {statusModalComplaintId}</p>
//                 </div>
//                 <div className="p-4 space-y-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Status</label>
//                     <Select
//                       value={statusDraft}
//                       onValueChange={(v) => setStatusDraft(v as "Pending" | "In Progress" | "Resolved" | "Rejected")}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="In Progress">In Progress</SelectItem>
//                         <SelectItem value="Resolved">Resolved</SelectItem>
//                         <SelectItem value="Rejected">Rejected</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Feedback</label>
//                     <Textarea
//                       value={feedbackDraft}
//                       onChange={(e) => setFeedbackDraft(e.target.value)}
//                       placeholder="Enter feedback or updates..."
//                       className="min-h-[100px]"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 border-t flex justify-end gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setStatusModalComplaintId(null);
//                       setFeedbackDraft("");
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button onClick={applyStatusUpdate}>Update</Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// import { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import {
//   BarChart3,
//   MapPin,
//   FileText,
//   Filter,
//   Download,
//   Settings,
//   Search,
//   TrendingUp,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Image as ImageIcon,
//   X,
// } from "lucide-react";

// interface Complaint {
//   id: string;
//   title: string;
//   type: string;
//   city: string;
//   department: string;
//   status: "Pending" | "In Progress" | "Resolved" | "Rejected";
//   date: string;
//   priority: "High" | "Medium" | "Low";
//   description: string;
//   location: string;
//   image: string;
//   feedback: string;
// }

// interface CityData {
//   city: string;
//   total: number;
//   pending: number;
//   inProgress: number;
//   resolved: number;
//   level: "High" | "Moderate" | "Low";
// }

// const AdminDashboard = () => {
//   const [selectedCity, setSelectedCity] = useState("all");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [detailsComplaintId, setDetailsComplaintId] = useState<string | null>(null);
//   const [statusModalComplaintId, setStatusModalComplaintId] = useState<string | null>(null);
//   const [statusDraft, setStatusDraft] = useState<"Pending" | "In Progress" | "Resolved" | "Rejected">("Pending");
//   const [feedbackDraft, setFeedbackDraft] = useState<string>("");
//   const [complaints, setComplaints] = useState<Complaint[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // Department mapping
//   const categoryToDepartment = {
//     Garbage: "Sanitation Department",
//     "Water Leakage": "Water Department",
//     "Street Light": "Electricity Department",
//     "Road Damage": "Road Department",
//     Other: "General Admin",
//   };

//   // Normalize status
//   const normalizeStatus = (status: string): Complaint["status"] => {
//     switch (status.toLowerCase()) {
//       case "pending":
//         return "Pending";
//       case "in progress":
//         return "In Progress";
//       case "resolved":
//         return "Resolved";
//       case "rejected":
//         return "Rejected";
//       default:
//         return "Pending";
//     }
//   };

//   // Derive stats and city data from complaints
//   const [stats, cityData] = useMemo(() => {
//     const stats = [
//       { title: "Total Complaints", value: complaints.length.toLocaleString(), change: "+0%", icon: FileText, color: "text-primary" },
//       {
//         title: "Pending Review",
//         value: complaints.filter(c => c.status === "Pending").length.toLocaleString(),
//         change: "+0%",
//         icon: Clock,
//         color: "text-warning",
//       },
//       {
//         title: "In Progress",
//         value: complaints.filter(c => c.status === "In Progress").length.toLocaleString(),
//         change: "+0%",
//         icon: TrendingUp,
//         color: "text-accent",
//       },
//       {
//         title: "Resolved",
//         value: complaints.filter(c => c.status === "Resolved").length.toLocaleString(),
//         change: "+0%",
//         icon: CheckCircle2,
//         color: "text-success",
//       },
//     ];

//     const cities = [...new Set(complaints.map(c => c.city))];
//     const cityData: CityData[] = cities.map(city => {
//       const cityComplaints = complaints.filter(c => c.city === city);
//       const total = cityComplaints.length;
//       const pending = cityComplaints.filter(c => c.status === "Pending").length;
//       const inProgress = cityComplaints.filter(c => c.status === "In Progress").length;
//       const resolved = cityComplaints.filter(c => c.status === "Resolved").length;
//       const level = total > 2000 ? "High" : total > 1000 ? "Moderate" : "Low";
//       return { city, total, pending, inProgress, resolved, level };
//     });

//     return [stats, cityData];
//   }, [complaints]);

//   const cityPositions: Record<string, { x: number; y: number }> = {
//     "New Delhi": { x: 48, y: 23 },
//     Mumbai: { x: 33, y: 62 },
//     Bangalore: { x: 45, y: 75 },
//     Chennai: { x: 56, y: 77 },
//     Kolkata: { x: 73, y: 42 },
//     Pune: { x: 36, y: 65 },
//   };

//   const maxTotal = useMemo(() => Math.max(...cityData.map(c => c.total), 1), [cityData]);

//   // Fetch complaints on mount
//   useEffect(() => {
//     const fetchComplaints = async () => {
//       const token = localStorage.getItem("adminToken");
//       if (!token) {
//         toast({
//           title: "Authentication Required",
//           description: "Please log in to access the dashboard.",
//           variant: "destructive",
//         });
//         navigate("/admin-login");
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:5000/api/authority/complaints", {
//           method: "GET",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(response.status === 401 ? "Unauthorized access" : "Failed to fetch complaints");
//         }

//         const { complaints } = await response.json();

//         const mappedComplaints: Complaint[] = complaints.map((c: any) => ({
//           id: c._id,
//           title: c.title,
//           type: c.category,
//           city: c.city,
//           department: categoryToDepartment[c.category] || "General Admin",
//           status: normalizeStatus(c.status),
//           date: new Date(c.createdAt).toISOString().split("T")[0],
//           priority: c.urgency || "Medium",
//           description: c.description,
//           location: c.location,
//           image: c.image,
//           feedback: c.feedback || "",
//         }));

//         setComplaints(mappedComplaints);
//       } catch (err: any) {
//         toast({
//           title: "Error",
//           description: err.message || "Failed to load complaints.",
//           variant: "destructive",
//         });
//         if (err.message === "Unauthorized access") {
//           navigate("/admin-login");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, [navigate, toast]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return "bg-warning/10 text-warning border-warning/20";
//       case "In Progress":
//         return "bg-accent/10 text-accent border-accent/20";
//       case "Resolved":
//         return "bg-success/10 text-success border-success/20";
//       case "Rejected":
//         return "bg-destructive/10 text-destructive border-destructive/20";
//       default:
//         return "bg-muted/10 text-muted-foreground";
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "High":
//         return "bg-destructive/10 text-destructive border-destructive/20";
//       case "Medium":
//         return "bg-warning/10 text-warning border-warning/20";
//       case "Low":
//         return "bg-success/10 text-success border-success/20";
//       default:
//         return "bg-muted/10 text-muted-foreground";
//     }
//   };

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case "High":
//         return "text-destructive";
//       case "Moderate":
//         return "text-warning";
//       case "Low":
//         return "text-success";
//       default:
//         return "text-muted-foreground";
//     }
//   };

//   // Heatmap image state and controls
//   const [heatmapImageUrl, setHeatmapImageUrl] = useState<string>("");
//   const [heatmapUrlInput, setHeatmapUrlInput] = useState<string>("");
//   const [heatmapZoom, setHeatmapZoom] = useState<number>(1);
//   const applyHeatmapUrl = () => setHeatmapImageUrl(heatmapUrlInput.trim());
//   const onHeatmapFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const objectUrl = URL.createObjectURL(file);
//     setHeatmapImageUrl(objectUrl);
//   };
//   const zoomIn = () => setHeatmapZoom((z) => Math.min(3, z + 0.25));
//   const zoomOut = () => setHeatmapZoom((z) => Math.max(0.5, z - 0.25));
//   const zoomReset = () => setHeatmapZoom(1);

//   const filteredComplaints = useMemo(() => {
//     const cityMap: Record<string, string> = {
//       delhi: "New Delhi",
//       mumbai: "Mumbai",
//       bangalore: "Bangalore",
//       chennai: "Chennai",
//     };
//     const statusMap: Record<string, string> = {
//       pending: "Pending",
//       progress: "In Progress",
//       resolved: "Resolved",
//       rejected: "Rejected",
//     };
//     return complaints.filter((c) => {
//       const cityOk = selectedCity === "all" || c.city === cityMap[selectedCity];
//       const deptOk = selectedDepartment === "all" || c.department.toLowerCase().includes(selectedDepartment.toLowerCase());
//       const statusOk = selectedStatus === "all" || c.status === statusMap[selectedStatus];
//       const q = searchQuery.trim().toLowerCase();
//       const searchOk =
//         q.length === 0 ||
//         c.id.toLowerCase().includes(q) ||
//         c.title.toLowerCase().includes(q) ||
//         c.type.toLowerCase().includes(q) ||
//         c.city.toLowerCase().includes(q) ||
//         c.department.toLowerCase().includes(q);
//       return cityOk && deptOk && statusOk && searchOk;
//     });
//   }, [complaints, selectedCity, selectedDepartment, selectedStatus, searchQuery]);

//   const handleExportCsv = () => {
//     const headers = ["ID", "Title", "Type", "City", "Department", "Status", "Date", "Priority", "Description", "Location", "Feedback"];
//     const rows = filteredComplaints.map(c => [
//       c.id,
//       c.title,
//       c.type,
//       c.city,
//       c.department,
//       c.status,
//       c.date,
//       c.priority,
//       c.description,
//       c.location,
//       c.feedback,
//     ]);
//     const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "complaints_export.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const openStatusModal = (
//     id: string,
//     currentStatus: "Pending" | "In Progress" | "Resolved" | "Rejected",
//     currentFeedback: string
//   ) => {
//     setStatusModalComplaintId(id);
//     setStatusDraft(currentStatus);
//     setFeedbackDraft(currentFeedback);
//   };

//   const applyStatusUpdate = async () => {
//     if (!statusModalComplaintId) return;

//     const token = localStorage.getItem("adminToken");
//     if (!token) {
//       toast({
//         title: "Authentication Error",
//         description: "Please log in again.",
//         variant: "destructive",
//       });
//       navigate("/admin-login");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/api/authority/complaint/${statusModalComplaintId}`, {
//         method: "PUT",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: statusDraft.toLowerCase(), feedback: feedbackDraft }),
//       });

//       if (!response.ok) {
//         throw new Error(response.status === 403 ? "Unauthorized to update this complaint" : "Failed to update complaint");
//       }

//       const { complaint } = await response.json();
//       setComplaints(prev =>
//         prev.map(c =>
//           c.id === statusModalComplaintId
//             ? {
//                 ...c,
//                 status: normalizeStatus(complaint.status),
//                 feedback: complaint.feedback || "",
//               }
//             : c
//         )
//       );
//       toast({
//         title: "Success",
//         description: "Complaint status and feedback updated successfully.",
//       });
//       setStatusModalComplaintId(null);
//       setFeedbackDraft("");
//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err.message || "Failed to update complaint.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
//       <div className="container mx-auto px-4">
//         <div className="space-y-8">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
//             <div>
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//               <p className="text-muted-foreground">Manage and monitor civic complaints across all cities</p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button variant="outline" size="sm" onClick={handleExportCsv}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Export Data
//               </Button>
//               <Button size="sm" onClick={() => alert("Settings coming soon")}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Settings
//               </Button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, index) => (
//               <Card key={index}>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                       <p className="text-2xl font-bold">{stat.value}</p>
//                       <p className="text-xs text-muted-foreground">
//                         <span className={stat.change.startsWith("+") ? "text-success" : "text-destructive"}>
//                           {stat.change}
//                         </span>{" "}
//                         from last month
//                       </p>
//                     </div>
//                     <stat.icon className={`h-8 w-8 ${stat.color}`} />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Main Content */}
//           <Tabs defaultValue="complaints" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="complaints">Complaints Management</TabsTrigger>
//               <TabsTrigger value="analytics">City Analytics</TabsTrigger>
//               <TabsTrigger value="heatmap">Complaint Heatmap</TabsTrigger>
//             </TabsList>

//             {/* Complaints Management */}
//             <TabsContent value="complaints" className="space-y-6">
//               {/* Filters */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <Filter className="h-5 w-5" />
//                     <span>Filters</span>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">City</label>
//                       <Select value={selectedCity} onValueChange={setSelectedCity}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select city" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Cities</SelectItem>
//                           {[...new Set(complaints.map(c => c.city))].map(city => (
//                             <SelectItem key={city} value={city.toLowerCase()}>
//                               {city}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Department</label>
//                       <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select department" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Departments</SelectItem>
//                           <SelectItem value="sanitation">Sanitation</SelectItem>
//                           <SelectItem value="water">Water</SelectItem>
//                           <SelectItem value="electricity">Electricity</SelectItem>
//                           <SelectItem value="road">Road</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Status</label>
//                       <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Status</SelectItem>
//                           <SelectItem value="pending">Pending</SelectItem>
//                           <SelectItem value="progress">In Progress</SelectItem>
//                           <SelectItem value="resolved">Resolved</SelectItem>
//                           <SelectItem value="rejected">Rejected</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Search</label>
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           placeholder="Search complaints..."
//                           className="pl-10"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Complaints Table */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Complaints</CardTitle>
//                   <CardDescription>Latest complaints submitted across all cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {isLoading ? (
//                     <div className="flex justify-center items-center py-8">
//                       <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//                     </div>
//                   ) : filteredComplaints.length === 0 ? (
//                     <p className="text-center text-muted-foreground">No complaints found.</p>
//                   ) : (
//                     <div className="space-y-4">
//                       {filteredComplaints.map((complaint) => (
//                         <div key={complaint.id} className="border rounded-lg p-4 space-y-3">
//                           <div className="flex items-start justify-between">
//                             <div className="space-y-1">
//                               <h4 className="font-medium">{complaint.title}</h4>
//                               <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                               <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                               <span className="text-muted-foreground">Type:</span>
//                               <p className="font-medium">{complaint.type}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">City:</span>
//                               <p className="font-medium">{complaint.city}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">Department:</span>
//                               <p className="font-medium">{complaint.department}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">Date:</span>
//                               <p className="font-medium">{complaint.date}</p>
//                             </div>
//                           </div>

//                           <div className="flex justify-end space-x-2">
//                             <Button variant="outline" size="sm" onClick={() => setDetailsComplaintId(complaint.id)}>
//                               View Details
//                             </Button>
//                             <Button
//                               size="sm"
//                               onClick={() =>
//                                 openStatusModal(complaint.id, complaint.status, complaint.feedback)
//                               }
//                             >
//                               Update Status
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* City Analytics */}
//             <TabsContent value="analytics" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <BarChart3 className="h-5 w-5" />
//                     <span>City-wise Complaint Analysis</span>
//                   </CardTitle>
//                   <CardDescription>Complaint statistics across major cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {cityData.map((city, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-3">
//                             <MapPin className="h-5 w-5 text-muted-foreground" />
//                             <div>
//                               <h4 className="font-medium">{city.city}</h4>
//                               <p className="text-sm text-muted-foreground">Total: {city.total} complaints</p>
//                             </div>
//                           </div>
//                           <Badge className={`${getLevelColor(city.level)}`} variant="outline">
//                             {city.level} Activity
//                           </Badge>
//                         </div>

//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div className="text-center p-2 bg-warning/10 rounded">
//                             <p className="font-medium text-warning">{city.pending}</p>
//                             <p className="text-muted-foreground">Pending</p>
//                           </div>
//                           <div className="text-center p-2 bg-accent/10 rounded">
//                             <p className="font-medium text-accent">{city.inProgress}</p>
//                             <p className="text-muted-foreground">In Progress</p>
//                           </div>
//                           <div className="text-center p-2 bg-success/10 rounded">
//                             <p className="font-medium text-success">{city.resolved}</p>
//                             <p className="text-muted-foreground">Resolved</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Heatmap */}
//             <TabsContent value="heatmap" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <MapPin className="h-5 w-5" />
//                     <span>Complaint Density Heatmap</span>
//                   </CardTitle>
//                   <CardDescription>India map with complaint density overlay. You can also show a custom heatmap image.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* India Map Density Overlay */}
//                     <div className="w-full bg-muted/20 rounded-lg border p-3">
//                       <div className="relative mx-auto max-w-3xl">
//                         <img
//                           src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag-map_of_India.svg"
//                           alt="India Map"
//                           className="w-full h-auto opacity-90 select-none"
//                           draggable={false}
//                         />
//                         {cityData.map((c, idx) => {
//                           const pos = cityPositions[c.city];
//                           if (!pos) return null;
//                           const intensity = Math.max(0.2, c.total / maxTotal);
//                           const red = Math.floor(255 * intensity);
//                           const green = Math.floor(180 * (1 - intensity));
//                           const bg = `rgba(${red}, ${green}, 64, 0.65)`;
//                           return (
//                             <div
//                               key={idx}
//                               className="absolute rounded-full border border-border/50"
//                               style={{
//                                 left: `${pos.x}%`,
//                                 top: `${pos.y}%`,
//                                 width: `${14 + 18 * intensity}px`,
//                                 height: `${14 + 18 * intensity}px`,
//                                 transform: "translate(-50%, -50%)",
//                                 backgroundColor: bg,
//                                 boxShadow: `0 0 ${8 + 10 * intensity}px ${bg}`,
//                               }}
//                               title={`${c.city}: ${c.total} complaints`}
//                             />
//                           );
//                         })}
//                       </div>
//                       <p className="text-center text-xs text-muted-foreground mt-2">
//                         Relative density circles by city (size and color ~ total complaints)
//                       </p>
//                     </div>
//                     {/* Controls */}
//                     <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
//                       <div className="flex-1 flex items-center gap-2">
//                         <Input
//                           placeholder="Paste heatmap image URL"
//                           value={heatmapUrlInput}
//                           onChange={(e) => setHeatmapUrlInput(e.target.value)}
//                         />
//                         <Button variant="outline" onClick={applyHeatmapUrl}>
//                           Apply
//                         </Button>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input id="heatmapFile" type="file" accept="image/*" className="hidden" onChange={onHeatmapFile} />
//                         <Button variant="outline" onClick={() => document.getElementById("heatmapFile")?.click()}>
//                           Upload Image
//                         </Button>
//                         <Button variant="outline" onClick={zoomOut}>
//                           -
//                         </Button>
//                         <Button variant="outline" onClick={zoomReset}>
//                           100%
//                         </Button>
//                         <Button variant="outline" onClick={zoomIn}>
//                           +
//                         </Button>
//                       </div>
//                     </div>

//                     {/* Legend */}
//                     <div className="flex items-center justify-center space-x-6">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-success rounded"></div>
//                         <span className="text-sm">Low</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-warning rounded"></div>
//                         <span className="text-sm">Moderate</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-destructive rounded"></div>
//                         <span className="text-sm">High</span>
//                       </div>
//                     </div>

//                     {/* Optional custom heatmap image */}
//                     {heatmapImageUrl && (
//                       <div className="w-full bg-muted/20 rounded-lg border overflow-hidden">
//                         <div className="w-full h-[420px] md:h-[520px] overflow-auto">
//                           <img
//                             src={heatmapImageUrl}
//                             alt="Complaint Density Heatmap"
//                             className="block mx-auto select-none"
//                             style={{ transform: `scale(${heatmapZoom})`, transformOrigin: "center center" }}
//                             draggable={false}
//                           />
//                         </div>
//                       </div>
//                     )}

//                     {heatmapImageUrl && (
//                       <p className="text-center text-sm text-muted-foreground">
//                         Zoom with the controls above. Upload or paste a different image URL to replace.
//                       </p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Details Modal */}
//           {detailsComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//               <div className="bg-background rounded-lg shadow-lg w-full max-w-lg border max-h-[80vh] overflow-y-auto relative">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="absolute top-2 right-2"
//                   onClick={() => setDetailsComplaintId(null)}
//                   aria-label="Close modal"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold mb-2">Complaint Details</h3>
//                   <p className="text-sm text-muted-foreground mb-4">ID: {detailsComplaintId}</p>
//                   {(() => {
//                     const complaint = complaints.find(c => c.id === detailsComplaintId);
//                     if (!complaint) return <p className="text-sm text-destructive">Complaint not found</p>;
//                     return (
//                       <div className="space-y-4">
//                         <div>
//                           <p className="text-sm font-medium">Title</p>
//                           <p className="text-sm text-muted-foreground">{complaint.title}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Description</p>
//                           <p className="text-sm text-muted-foreground">{complaint.description}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Location</p>
//                           <p className="text-sm text-muted-foreground">{complaint.location}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Type</p>
//                           <p className="text-sm text-muted-foreground">{complaint.type}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">City</p>
//                           <p className="text-sm text-muted-foreground">{complaint.city}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Department</p>
//                           <p className="text-sm text-muted-foreground">{complaint.department}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Status</p>
//                           <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Priority</p>
//                           <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">Date Submitted</p>
//                           <p className="text-sm text-muted-foreground">{complaint.date}</p>
//                         </div>
//                         {complaint.image && (
//                           <div>
//                             <p className="text-sm font-medium">Photo Evidence</p>
//                             <img
//                               src={complaint.image}
//                               alt="Complaint evidence"
//                               className="max-w-full h-auto rounded-lg mt-2"
//                             />
//                           </div>
//                         )}
//                         {complaint.feedback && (
//                           <div>
//                             <p className="text-sm font-medium">Feedback</p>
//                             <p className="text-sm text-muted-foreground">{complaint.feedback}</p>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })()}
//                   <div className="flex justify-end gap-2 mt-6">
//                     <Button variant="outline" onClick={() => setDetailsComplaintId(null)}>
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Update Status Modal */}
//           {statusModalComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//               <div className="bg-background rounded-lg shadow-lg w-full max-w-md border max-h-[80vh] overflow-y-auto">
//                 <div className="p-4 border-b">
//                   <h3 className="text-lg font-semibold">Update Complaint</h3>
//                   <p className="text-sm text-muted-foreground">ID: {statusModalComplaintId}</p>
//                 </div>
//                 <div className="p-4 space-y-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Status</label>
//                     <Select
//                       value={statusDraft}
//                       onValueChange={(v) => setStatusDraft(v as "Pending" | "In Progress" | "Resolved" | "Rejected")}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="In Progress">In Progress</SelectItem>
//                         <SelectItem value="Resolved">Resolved</SelectItem>
//                         <SelectItem value="Rejected">Rejected</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Feedback</label>
//                     <Textarea
//                       value={feedbackDraft}
//                       onChange={(e) => setFeedbackDraft(e.target.value)}
//                       placeholder="Enter feedback or updates..."
//                       className="min-h-[100px]"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 border-t flex justify-end gap-2">
//                   <Button variant="outline" onClick={() => {
//                     setStatusModalComplaintId(null);
//                     setFeedbackDraft("");
//                   }}>
//                     Cancel
//                   </Button>
//                   <Button onClick={applyStatusUpdate}>Update</Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
// import { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import {
//   BarChart3,
//   MapPin,
//   FileText,
//   Filter,
//   Download,
//   Settings,
//   Search,
//   TrendingUp,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Image as ImageIcon,
// } from "lucide-react";

// interface Complaint {
//   id: string;
//   title: string;
//   type: string;
//   city: string;
//   department: string;
//   status: "Pending" | "In Progress" | "Resolved" | "Rejected";
//   date: string;
//   priority: "High" | "Medium" | "Low";
//   description: string;
//   location: string;
//   image: string;
//   feedback: string;
// }

// interface CityData {
//   city: string;
//   total: number;
//   pending: number;
//   inProgress: number;
//   resolved: number;
//   level: "High" | "Moderate" | "Low";
// }

// const AdminDashboard = () => {
//   const [selectedCity, setSelectedCity] = useState("all");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [selectedStatus, setSelectedStatus] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [detailsComplaintId, setDetailsComplaintId] = useState<string | null>(null);
//   const [statusModalComplaintId, setStatusModalComplaintId] = useState<string | null>(null);
//   const [statusDraft, setStatusDraft] = useState<"Pending" | "In Progress" | "Resolved" | "Rejected">("Pending");
//   const [priorityDraft, setPriorityDraft] = useState<"High" | "Medium" | "Low">("Medium");
//   const [complaints, setComplaints] = useState<Complaint[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // Department mapping
//   const categoryToDepartment = {
//     Garbage: "Sanitation Department",
//     "Water Leakage": "Water Department",
//     "Street Light": "Electricity Department",
//     "Road Damage": "Road Department",
//     Other: "General Admin",
//   };

//   // Normalize status
//   const normalizeStatus = (status: string): Complaint["status"] => {
//     switch (status.toLowerCase()) {
//       case "pending":
//         return "Pending";
//       case "in progress":
//         return "In Progress";
//       case "resolved":
//         return "Resolved";
//       case "rejected":
//         return "Rejected";
//       default:
//         return "Pending";
//     }
//   };

//   // Derive stats and city data from complaints
//   const [stats, cityData] = useMemo(() => {
//     const stats = [
//       { title: "Total Complaints", value: complaints.length.toLocaleString(), change: "+0%", icon: FileText, color: "text-primary" },
//       {
//         title: "Pending Review",
//         value: complaints.filter(c => c.status === "Pending").length.toLocaleString(),
//         change: "+0%",
//         icon: Clock,
//         color: "text-warning",
//       },
//       {
//         title: "In Progress",
//         value: complaints.filter(c => c.status === "In Progress").length.toLocaleString(),
//         change: "+0%",
//         icon: TrendingUp,
//         color: "text-accent",
//       },
//       {
//         title: "Resolved",
//         value: complaints.filter(c => c.status === "Resolved").length.toLocaleString(),
//         change: "+0%",
//         icon: CheckCircle2,
//         color: "text-success",
//       },
//     ];

//     const cities = [...new Set(complaints.map(c => c.city))];
//     const cityData: CityData[] = cities.map(city => {
//       const cityComplaints = complaints.filter(c => c.city === city);
//       const total = cityComplaints.length;
//       const pending = cityComplaints.filter(c => c.status === "Pending").length;
//       const inProgress = cityComplaints.filter(c => c.status === "In Progress").length;
//       const resolved = cityComplaints.filter(c => c.status === "Resolved").length;
//       const level = total > 2000 ? "High" : total > 1000 ? "Moderate" : "Low";
//       return { city, total, pending, inProgress, resolved, level };
//     });

//     return [stats, cityData];
//   }, [complaints]);

//   const cityPositions: Record<string, { x: number; y: number }> = {
//     "New Delhi": { x: 48, y: 23 },
//     Mumbai: { x: 33, y: 62 },
//     Bangalore: { x: 45, y: 75 },
//     Chennai: { x: 56, y: 77 },
//     Kolkata: { x: 73, y: 42 },
//     Pune: { x: 36, y: 65 },
//   };

//   const maxTotal = useMemo(() => Math.max(...cityData.map(c => c.total), 1), [cityData]);

//   // Fetch complaints on mount
//   useEffect(() => {
//     const fetchComplaints = async () => {
//       const token = localStorage.getItem("adminToken");
//       if (!token) {
//         toast({
//           title: "Authentication Required",
//           description: "Please log in to access the dashboard.",
//           variant: "destructive",
//         });
//         navigate("/admin-login");
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:5000/api/authority/complaints", {
//           method: "GET",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(response.status === 401 ? "Unauthorized access" : "Failed to fetch complaints");
//         }

//         const { complaints } = await response.json();

//         const mappedComplaints: Complaint[] = complaints.map((c: any) => ({
//           id: c._id,
//           title: c.title,
//           type: c.category,
//           city: c.city,
//           department: categoryToDepartment[c.category] || "General Admin",
//           status: normalizeStatus(c.status),
//           date: new Date(c.createdAt).toISOString().split("T")[0],
//           priority: c.urgency || "Medium",
//           description: c.description,
//           location: c.location,
//           image: c.image,
//           feedback: c.feedback || "",
//         }));

//         setComplaints(mappedComplaints);
//       } catch (err: any) {
//         toast({
//           title: "Error",
//           description: err.message || "Failed to load complaints.",
//           variant: "destructive",
//         });
//         if (err.message === "Unauthorized access") {
//           navigate("/admin-login");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchComplaints();
//   }, [navigate, toast]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Pending":
//         return "bg-warning/10 text-warning border-warning/20";
//       case "In Progress":
//         return "bg-accent/10 text-accent border-accent/20";
//       case "Resolved":
//         return "bg-success/10 text-success border-success/20";
//       case "Rejected":
//         return "bg-destructive/10 text-destructive border-destructive/20";
//       default:
//         return "bg-muted/10 text-muted-foreground";
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "High":
//         return "bg-destructive/10 text-destructive border-destructive/20";
//       case "Medium":
//         return "bg-warning/10 text-warning border-warning/20";
//       case "Low":
//         return "bg-success/10 text-success border-success/20";
//       default:
//         return "bg-muted/10 text-muted-foreground";
//     }
//   };

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case "High":
//         return "text-destructive";
//       case "Moderate":
//         return "text-warning";
//       case "Low":
//         return "text-success";
//       default:
//         return "text-muted-foreground";
//     }
//   };

//   // Heatmap image state and controls
//   const [heatmapImageUrl, setHeatmapImageUrl] = useState<string>("");
//   const [heatmapUrlInput, setHeatmapUrlInput] = useState<string>("");
//   const [heatmapZoom, setHeatmapZoom] = useState<number>(1);
//   const applyHeatmapUrl = () => setHeatmapImageUrl(heatmapUrlInput.trim());
//   const onHeatmapFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const objectUrl = URL.createObjectURL(file);
//     setHeatmapImageUrl(objectUrl);
//   };
//   const zoomIn = () => setHeatmapZoom((z) => Math.min(3, z + 0.25));
//   const zoomOut = () => setHeatmapZoom((z) => Math.max(0.5, z - 0.25));
//   const zoomReset = () => setHeatmapZoom(1);

//   const filteredComplaints = useMemo(() => {
//     const cityMap: Record<string, string> = {
//       delhi: "New Delhi",
//       mumbai: "Mumbai",
//       bangalore: "Bangalore",
//       chennai: "Chennai",
//     };
//     const statusMap: Record<string, string> = {
//       pending: "Pending",
//       progress: "In Progress",
//       resolved: "Resolved",
//       rejected: "Rejected",
//     };
//     return complaints.filter((c) => {
//       const cityOk = selectedCity === "all" || c.city === cityMap[selectedCity];
//       const deptOk = selectedDepartment === "all" || c.department.toLowerCase().includes(selectedDepartment.toLowerCase());
//       const statusOk = selectedStatus === "all" || c.status === statusMap[selectedStatus];
//       const q = searchQuery.trim().toLowerCase();
//       const searchOk =
//         q.length === 0 ||
//         c.id.toLowerCase().includes(q) ||
//         c.title.toLowerCase().includes(q) ||
//         c.type.toLowerCase().includes(q) ||
//         c.city.toLowerCase().includes(q) ||
//         c.department.toLowerCase().includes(q);
//       return cityOk && deptOk && statusOk && searchOk;
//     });
//   }, [complaints, selectedCity, selectedDepartment, selectedStatus, searchQuery]);

//   const handleExportCsv = () => {
//     const headers = ["ID", "Title", "Type", "City", "Department", "Status", "Date", "Priority", "Description", "Location"];
//     const rows = filteredComplaints.map(c => [
//       c.id,
//       c.title,
//       c.type,
//       c.city,
//       c.department,
//       c.status,
//       c.date,
//       c.priority,
//       c.description,
//       c.location,
//     ]);
//     const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "complaints_export.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const openStatusModal = (
//     id: string,
//     currentStatus: "Pending" | "In Progress" | "Resolved" | "Rejected",
//     currentPriority: "High" | "Medium" | "Low"
//   ) => {
//     setStatusModalComplaintId(id);
//     setStatusDraft(currentStatus);
//     setPriorityDraft(currentPriority);
//   };

//   const applyStatusUpdate = async () => {
//     if (!statusModalComplaintId) return;

//     const token = localStorage.getItem("adminToken");
//     if (!token) {
//       toast({
//         title: "Authentication Error",
//         description: "Please log in again.",
//         variant: "destructive",
//       });
//       navigate("/admin-login");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/api/complaint/${statusModalComplaintId}`, {
//         method: "PATCH",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ status: statusDraft.toLowerCase(), urgency: priorityDraft }),
//       });

//       if (!response.ok) {
//         throw new Error(response.status === 403 ? "Unauthorized to update this complaint" : "Failed to update complaint");
//       }

//       const { complaint } = await response.json();
//       setComplaints(prev =>
//         prev.map(c =>
//           c.id === statusModalComplaintId
//             ? {
//                 ...c,
//                 status: normalizeStatus(complaint.status),
//                 priority: complaint.urgency || "Medium",
//               }
//             : c
//         )
//       );
//       toast({
//         title: "Success",
//         description: "Complaint status updated successfully.",
//       });
//       setStatusModalComplaintId(null);
//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err.message || "Failed to update complaint.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
//       <div className="container mx-auto px-4">
//         <div className="space-y-8">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
//             <div>
//               <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//               <p className="text-muted-foreground">Manage and monitor civic complaints across all cities</p>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button variant="outline" size="sm" onClick={handleExportCsv}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Export Data
//               </Button>
//               <Button size="sm" onClick={() => alert("Settings coming soon")}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Settings
//               </Button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, index) => (
//               <Card key={index}>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                       <p className="text-2xl font-bold">{stat.value}</p>
//                       <p className="text-xs text-muted-foreground">
//                         <span className={stat.change.startsWith("+") ? "text-success" : "text-destructive"}>
//                           {stat.change}
//                         </span>{" "}
//                         from last month
//                       </p>
//                     </div>
//                     <stat.icon className={`h-8 w-8 ${stat.color}`} />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Main Content */}
//           <Tabs defaultValue="complaints" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="complaints">Complaints Management</TabsTrigger>
//               <TabsTrigger value="analytics">City Analytics</TabsTrigger>
//               <TabsTrigger value="heatmap">Complaint Heatmap</TabsTrigger>
//             </TabsList>

//             {/* Complaints Management */}
//             <TabsContent value="complaints" className="space-y-6">
//               {/* Filters */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <Filter className="h-5 w-5" />
//                     <span>Filters</span>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">City</label>
//                       <Select value={selectedCity} onValueChange={setSelectedCity}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select city" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Cities</SelectItem>
//                           {[...new Set(complaints.map(c => c.city))].map(city => (
//                             <SelectItem key={city} value={city.toLowerCase()}>
//                               {city}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Department</label>
//                       <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select department" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Departments</SelectItem>
//                           <SelectItem value="sanitation">Sanitation</SelectItem>
//                           <SelectItem value="water">Water</SelectItem>
//                           <SelectItem value="electricity">Electricity</SelectItem>
//                           <SelectItem value="road">Road</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Status</label>
//                       <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Status</SelectItem>
//                           <SelectItem value="pending">Pending</SelectItem>
//                           <SelectItem value="progress">In Progress</SelectItem>
//                           <SelectItem value="resolved">Resolved</SelectItem>
//                           <SelectItem value="rejected">Rejected</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">Search</label>
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                         <Input
//                           placeholder="Search complaints..."
//                           className="pl-10"
//                           value={searchQuery}
//                           onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Complaints Table */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Recent Complaints</CardTitle>
//                   <CardDescription>Latest complaints submitted across all cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {isLoading ? (
//                     <div className="flex justify-center items-center py-8">
//                       <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//                     </div>
//                   ) : filteredComplaints.length === 0 ? (
//                     <p className="text-center text-muted-foreground">No complaints found.</p>
//                   ) : (
//                     <div className="space-y-4">
//                       {filteredComplaints.map((complaint) => (
//                         <div key={complaint.id} className="border rounded-lg p-4 space-y-3">
//                           <div className="flex items-start justify-between">
//                             <div className="space-y-1">
//                               <h4 className="font-medium">{complaint.title}</h4>
//                               <p className="text-sm text-muted-foreground">ID: {complaint.id}</p>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                               <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                               <span className="text-muted-foreground">Type:</span>
//                               <p className="font-medium">{complaint.type}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">City:</span>
//                               <p className="font-medium">{complaint.city}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">Department:</span>
//                               <p className="font-medium">{complaint.department}</p>
//                             </div>
//                             <div>
//                               <span className="text-muted-foreground">Date:</span>
//                               <p className="font-medium">{complaint.date}</p>
//                             </div>
//                           </div>

//                           <div className="flex justify-end space-x-2">
//                             <Button variant="outline" size="sm" onClick={() => setDetailsComplaintId(complaint.id)}>
//                               View Details
//                             </Button>
//                             <Button
//                               size="sm"
//                               onClick={() =>
//                                 openStatusModal(complaint.id, complaint.status, complaint.priority)
//                               }
//                             >
//                               Update Status
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* City Analytics */}
//             <TabsContent value="analytics" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <BarChart3 className="h-5 w-5" />
//                     <span>City-wise Complaint Analysis</span>
//                   </CardTitle>
//                   <CardDescription>Complaint statistics across major cities</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {cityData.map((city, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-3">
//                             <MapPin className="h-5 w-5 text-muted-foreground" />
//                             <div>
//                               <h4 className="font-medium">{city.city}</h4>
//                               <p className="text-sm text-muted-foreground">Total: {city.total} complaints</p>
//                             </div>
//                           </div>
//                           <Badge className={`${getLevelColor(city.level)}`} variant="outline">
//                             {city.level} Activity
//                           </Badge>
//                         </div>

//                         <div className="grid grid-cols-3 gap-4 text-sm">
//                           <div className="text-center p-2 bg-warning/10 rounded">
//                             <p className="font-medium text-warning">{city.pending}</p>
//                             <p className="text-muted-foreground">Pending</p>
//                           </div>
//                           <div className="text-center p-2 bg-accent/10 rounded">
//                             <p className="font-medium text-accent">{city.inProgress}</p>
//                             <p className="text-muted-foreground">In Progress</p>
//                           </div>
//                           <div className="text-center p-2 bg-success/10 rounded">
//                             <p className="font-medium text-success">{city.resolved}</p>
//                             <p className="text-muted-foreground">Resolved</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Heatmap */}
//             <TabsContent value="heatmap" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <MapPin className="h-5 w-5" />
//                     <span>Complaint Density Heatmap</span>
//                   </CardTitle>
//                   <CardDescription>India map with complaint density overlay. You can also show a custom heatmap image.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* India Map Density Overlay */}
//                     <div className="w-full bg-muted/20 rounded-lg border p-3">
//                       <div className="relative mx-auto max-w-3xl">
//                         <img
//                           src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag-map_of_India.svg"
//                           alt="India Map"
//                           className="w-full h-auto opacity-90 select-none"
//                           draggable={false}
//                         />
//                         {cityData.map((c, idx) => {
//                           const pos = cityPositions[c.city];
//                           if (!pos) return null;
//                           const intensity = Math.max(0.2, c.total / maxTotal);
//                           const red = Math.floor(255 * intensity);
//                           const green = Math.floor(180 * (1 - intensity));
//                           const bg = `rgba(${red}, ${green}, 64, 0.65)`;
//                           return (
//                             <div
//                               key={idx}
//                               className="absolute rounded-full border border-border/50"
//                               style={{
//                                 left: `${pos.x}%`,
//                                 top: `${pos.y}%`,
//                                 width: `${14 + 18 * intensity}px`,
//                                 height: `${14 + 18 * intensity}px`,
//                                 transform: "translate(-50%, -50%)",
//                                 backgroundColor: bg,
//                                 boxShadow: `0 0 ${8 + 10 * intensity}px ${bg}`,
//                               }}
//                               title={`${c.city}: ${c.total} complaints`}
//                             />
//                           );
//                         })}
//                       </div>
//                       <p className="text-center text-xs text-muted-foreground mt-2">
//                         Relative density circles by city (size and color ~ total complaints)
//                       </p>
//                     </div>
//                     {/* Controls */}
//                     <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
//                       <div className="flex-1 flex items-center gap-2">
//                         <Input
//                           placeholder="Paste heatmap image URL"
//                           value={heatmapUrlInput}
//                           onChange={(e) => setHeatmapUrlInput(e.target.value)}
//                         />
//                         <Button variant="outline" onClick={applyHeatmapUrl}>
//                           Apply
//                         </Button>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input id="heatmapFile" type="file" accept="image/*" className="hidden" onChange={onHeatmapFile} />
//                         <Button variant="outline" onClick={() => document.getElementById("heatmapFile")?.click()}>
//                           Upload Image
//                         </Button>
//                         <Button variant="outline" onClick={zoomOut}>
//                           -
//                         </Button>
//                         <Button variant="outline" onClick={zoomReset}>
//                           100%
//                         </Button>
//                         <Button variant="outline" onClick={zoomIn}>
//                           +
//                         </Button>
//                       </div>
//                     </div>

//                     {/* Legend */}
//                     <div className="flex items-center justify-center space-x-6">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-success rounded"></div>
//                         <span className="text-sm">Low</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-warning rounded"></div>
//                         <span className="text-sm">Moderate</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <div className="w-4 h-4 bg-destructive rounded"></div>
//                         <span className="text-sm">High</span>
//                       </div>
//                     </div>

//                     {/* Optional custom heatmap image */}
//                     {heatmapImageUrl && (
//                       <div className="w-full bg-muted/20 rounded-lg border overflow-hidden">
//                         <div className="w-full h-[420px] md:h-[520px] overflow-auto">
//                           <img
//                             src={heatmapImageUrl}
//                             alt="Complaint Density Heatmap"
//                             className="block mx-auto select-none"
//                             style={{ transform: `scale(${heatmapZoom})`, transformOrigin: "center center" }}
//                             draggable={false}
//                           />
//                         </div>
//                       </div>
//                     )}

//                     {heatmapImageUrl && (
//                       <p className="text-center text-sm text-muted-foreground">
//                         Zoom with the controls above. Upload or paste a different image URL to replace.
//                       </p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Details Modal */}
//           {detailsComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//               <div className="bg-background rounded-lg shadow-lg w-full max-w-lg border p-6">
//                 <h3 className="text-lg font-semibold mb-2">Complaint Details</h3>
//                 <p className="text-sm text-muted-foreground mb-4">ID: {detailsComplaintId}</p>
//                 {(() => {
//                   const complaint = complaints.find(c => c.id === detailsComplaintId);
//                   if (!complaint) return <p className="text-sm text-destructive">Complaint not found</p>;
//                   return (
//                     <div className="space-y-4">
//                       <div>
//                         <p className="text-sm font-medium">Title</p>
//                         <p className="text-sm text-muted-foreground">{complaint.title}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Description</p>
//                         <p className="text-sm text-muted-foreground">{complaint.description}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Location</p>
//                         <p className="text-sm text-muted-foreground">{complaint.location}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Type</p>
//                         <p className="text-sm text-muted-foreground">{complaint.type}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">City</p>
//                         <p className="text-sm text-muted-foreground">{complaint.city}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Department</p>
//                         <p className="text-sm text-muted-foreground">{complaint.department}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Status</p>
//                         <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Priority</p>
//                         <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">Date Submitted</p>
//                         <p className="text-sm text-muted-foreground">{complaint.date}</p>
//                       </div>
//                       {complaint.image && (
//                         <div>
//                           <p className="text-sm font-medium">Photo Evidence</p>
//                           <img
//                             src={complaint.image}
//                             alt="Complaint evidence"
//                             className="max-w-full h-auto rounded-lg mt-2"
//                           />
//                         </div>
//                       )}
//                       {complaint.feedback && (
//                         <div>
//                           <p className="text-sm font-medium">Feedback</p>
//                           <p className="text-sm text-muted-foreground">{complaint.feedback}</p>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })()}
//                 <div className="flex justify-end gap-2 mt-6">
//                   <Button variant="outline" onClick={() => setDetailsComplaintId(null)}>
//                     Close
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Update Status Modal */}
//           {statusModalComplaintId && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//               <div className="bg-background rounded-lg shadow-lg w-full max-w-md border">
//                 <div className="p-4 border-b">
//                   <h3 className="text-lg font-semibold">Update Complaint</h3>
//                   <p className="text-sm text-muted-foreground">ID: {statusModalComplaintId}</p>
//                 </div>
//                 <div className="p-4 space-y-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Status</label>
//                     <Select
//                       value={statusDraft}
//                       onValueChange={(v) => setStatusDraft(v as "Pending" | "In Progress" | "Resolved" | "Rejected")}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="In Progress">In Progress</SelectItem>
//                         <SelectItem value="Resolved">Resolved</SelectItem>
//                         <SelectItem value="Rejected">Rejected</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Priority</label>
//                     <Select
//                       value={priorityDraft}
//                       onValueChange={(v) => setPriorityDraft(v as "High" | "Medium" | "Low")}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select priority" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="High">High</SelectItem>
//                         <SelectItem value="Medium">Medium</SelectItem>
//                         <SelectItem value="Low">Low</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="p-4 border-t flex justify-end gap-2">
//                   <Button variant="outline" onClick={() => setStatusModalComplaintId(null)}>
//                     Cancel
//                   </Button>
//                   <Button onClick={applyStatusUpdate}>Update</Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;