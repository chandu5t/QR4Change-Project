// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { 
//   MapPin, 
//   BarChart3, 
//   Users, 
//   TrendingUp, 
//   Clock, 
//   CheckCircle2, 
//   AlertTriangle,
//   Building,
//   Eye,
//   Shield
// } from "lucide-react";

// const TransparencyDashboard = () => {
//   const [selectedView, setSelectedView] = useState("national");
//   const [selectedState, setSelectedState] = useState("all");

//   // Mock data for different levels
//   const nationalStats = {
//     totalComplaints: 45623,
//     pending: 4562,
//     inProgress: 8934,
//     resolved: 32127,
//     activeCities: 156,
//     activeStates: 28
//   };

//   const stateData = [
//     { 
//       state: "Delhi", 
//       total: 8456, 
//       pending: 534, 
//       inProgress: 1234, 
//       resolved: 6688, 
//       cities: 12,
//       trend: "+8%",
//       level: "High"
//     },
//     { 
//       state: "Maharashtra", 
//       total: 7234, 
//       pending: 423, 
//       inProgress: 1876, 
//       resolved: 4935, 
//       cities: 24,
//       trend: "+12%",
//       level: "High"
//     },
//     { 
//       state: "Karnataka", 
//       total: 5678, 
//       pending: 345, 
//       inProgress: 1234, 
//       resolved: 4099, 
//       cities: 18,
//       trend: "+5%",
//       level: "Moderate"
//     },
//     { 
//       state: "Tamil Nadu", 
//       total: 4987, 
//       pending: 298, 
//       inProgress: 987, 
//       resolved: 3702, 
//       cities: 15,
//       trend: "+3%",
//       level: "Moderate"
//     },
//     { 
//       state: "West Bengal", 
//       total: 3456, 
//       pending: 234, 
//       inProgress: 678, 
//       resolved: 2544, 
//       cities: 11,
//       trend: "+1%",
//       level: "Low"
//     },
//     { 
//       state: "Gujarat", 
//       total: 2987, 
//       pending: 187, 
//       inProgress: 543, 
//       resolved: 2257, 
//       cities: 14,
//       trend: "+7%",
//       level: "Low"
//     }
//   ];

//   const cityData = [
//     { city: "New Delhi", state: "Delhi", total: 3456, resolved: 2655, efficiency: 77 },
//     { city: "Mumbai", state: "Maharashtra", total: 2890, resolved: 2256, efficiency: 78 },
//     { city: "Bangalore", state: "Karnataka", total: 2234, resolved: 1744, efficiency: 78 },
//     { city: "Chennai", state: "Tamil Nadu", total: 1876, resolved: 1464, efficiency: 78 },
//     { city: "Kolkata", state: "West Bengal", total: 1567, resolved: 1235, efficiency: 79 },
//     { city: "Pune", state: "Maharashtra", total: 1234, resolved: 987, efficiency: 80 },
//     { city: "Hyderabad", state: "Telangana", total: 1098, resolved: 876, efficiency: 80 },
//     { city: "Ahmedabad", state: "Gujarat", total: 987, resolved: 789, efficiency: 80 }
//   ];

//   const departmentStats = [
//     { department: "Sanitation", total: 12345, resolved: 9876, percentage: 80 },
//     { department: "Water", total: 8765, resolved: 7012, percentage: 80 },
//     { department: "Electricity", total: 6543, resolved: 5234, percentage: 80 },
//     { department: "Roads", total: 9876, resolved: 7890, percentage: 80 },
//     { department: "General Admin", total: 3456, resolved: 2768, percentage: 80 }
//   ];

//   const getEfficiencyColor = (efficiency: number) => {
//     if (efficiency >= 80) return "text-success";
//     if (efficiency >= 60) return "text-warning";
//     return "text-destructive";
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

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
//       <div className="container mx-auto px-4">
//         <div className="space-y-8">
//           {/* Header */}
//           <div className="text-center space-y-4">
//             <div className="flex items-center justify-center space-x-2 mb-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-gov-blue-light">
//                 <Eye className="h-6 w-6 text-primary-foreground" />
//               </div>
//               <h1 className="text-3xl font-bold">Public Transparency Dashboard</h1>
//             </div>
//             <p className="text-muted-foreground max-w-3xl mx-auto">
//               Real-time insights into civic complaint resolution across India. 
//               Track government responsiveness and efficiency at national, state, and city levels.
//             </p>
//             <Badge variant="secondary" className="bg-primary/10 text-primary">
//               <Shield className="h-4 w-4 mr-2" />
//               Open Government Data Initiative
//             </Badge>
//           </div>

//           {/* National Overview */}
//           <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Building className="h-5 w-5" />
//                 <span>National Overview</span>
//               </CardTitle>
//               <CardDescription>
//                 Nationwide civic complaint statistics and resolution metrics
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-primary">{nationalStats.totalComplaints.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">Total Complaints</p>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-success">{nationalStats.resolved.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">Resolved</p>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-accent">{nationalStats.inProgress.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">In Progress</p>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-warning">{nationalStats.pending.toLocaleString()}</p>
//                   <p className="text-sm text-muted-foreground">Pending</p>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-primary">{nationalStats.activeStates}</p>
//                   <p className="text-sm text-muted-foreground">Active States</p>
//                 </div>
//                 <div className="text-center space-y-2">
//                   <p className="text-2xl font-bold text-primary">{nationalStats.activeCities}</p>
//                   <p className="text-sm text-muted-foreground">Active Cities</p>
//                 </div>
//               </div>
              
//               {/* Resolution Rate */}
//               <div className="mt-6 p-4 bg-success/10 rounded-lg text-center">
//                 <p className="text-lg font-medium text-success">
//                   National Resolution Rate: {Math.round((nationalStats.resolved / nationalStats.totalComplaints) * 100)}%
//                 </p>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Efficiency has improved by 12% compared to last quarter
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Main Content Tabs */}
//           <Tabs defaultValue="states" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="states">State Performance</TabsTrigger>
//               <TabsTrigger value="cities">City Rankings</TabsTrigger>
//               <TabsTrigger value="departments">Department Efficiency</TabsTrigger>
//             </TabsList>

//             {/* State Performance */}
//             <TabsContent value="states" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <MapPin className="h-5 w-5" />
//                     <span>State-wise Performance</span>
//                   </CardTitle>
//                   <CardDescription>
//                     Complaint resolution statistics across Indian states
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {stateData.map((state, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-3">
//                             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
//                               <span className="font-bold text-primary">#{index + 1}</span>
//                             </div>
//                             <div>
//                               <h4 className="font-medium">{state.state}</h4>
//                               <p className="text-sm text-muted-foreground">{state.cities} active cities</p>
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Badge variant="outline" className={getLevelColor(state.level)}>
//                               {state.level} Activity
//                             </Badge>
//                             <Badge variant="secondary" className="text-success">
//                               {state.trend}
//                             </Badge>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
//                           <div className="text-center p-2 bg-muted/20 rounded">
//                             <p className="font-bold">{state.total.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">Total</p>
//                           </div>
//                           <div className="text-center p-2 bg-success/10 rounded">
//                             <p className="font-bold text-success">{state.resolved.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">Resolved</p>
//                           </div>
//                           <div className="text-center p-2 bg-accent/10 rounded">
//                             <p className="font-bold text-accent">{state.inProgress.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">In Progress</p>
//                           </div>
//                           <div className="text-center p-2 bg-warning/10 rounded">
//                             <p className="font-bold text-warning">{state.pending.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">Pending</p>
//                           </div>
//                         </div>

//                         {/* Progress Bar */}
//                         <div className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span>Resolution Rate</span>
//                             <span className="font-medium">{Math.round((state.resolved / state.total) * 100)}%</span>
//                           </div>
//                           <div className="w-full bg-muted/20 rounded-full h-2">
//                             <div 
//                               className="bg-success h-2 rounded-full transition-all duration-500"
//                               style={{ width: `${(state.resolved / state.total) * 100}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* City Rankings */}
//             <TabsContent value="cities" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <TrendingUp className="h-5 w-5" />
//                     <span>Top Performing Cities</span>
//                   </CardTitle>
//                   <CardDescription>
//                     Cities ranked by complaint resolution efficiency
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {cityData.map((city, index) => (
//                       <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                         <div className="flex items-center space-x-4">
//                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                             <span className="text-sm font-bold text-primary">#{index + 1}</span>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">{city.city}</h4>
//                             <p className="text-sm text-muted-foreground">{city.state}</p>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center space-x-6">
//                           <div className="text-center">
//                             <p className="text-sm font-medium">{city.total.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">Total</p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-sm font-medium text-success">{city.resolved.toLocaleString()}</p>
//                             <p className="text-xs text-muted-foreground">Resolved</p>
//                           </div>
//                           <div className="text-center">
//                             <p className={`text-sm font-bold ${getEfficiencyColor(city.efficiency)}`}>
//                               {city.efficiency}%
//                             </p>
//                             <p className="text-xs text-muted-foreground">Efficiency</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Department Efficiency */}
//             <TabsContent value="departments" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center space-x-2">
//                     <BarChart3 className="h-5 w-5" />
//                     <span>Department Performance</span>
//                   </CardTitle>
//                   <CardDescription>
//                     Efficiency metrics across different government departments
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {departmentStats.map((dept, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-3">
//                             <Building className="h-5 w-5 text-muted-foreground" />
//                             <div>
//                               <h4 className="font-medium">{dept.department}</h4>
//                               <p className="text-sm text-muted-foreground">
//                                 {dept.resolved.toLocaleString()} of {dept.total.toLocaleString()} resolved
//                               </p>
//                             </div>
//                           </div>
//                           <Badge className={`${getEfficiencyColor(dept.percentage)}`} variant="outline">
//                             {dept.percentage}% Success Rate
//                           </Badge>
//                         </div>

//                         <div className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span>Resolution Progress</span>
//                             <span className="font-medium">{dept.percentage}%</span>
//                           </div>
//                           <div className="w-full bg-muted/20 rounded-full h-3">
//                             <div 
//                               className="bg-gradient-to-r from-success to-accent h-3 rounded-full transition-all duration-700"
//                               style={{ width: `${dept.percentage}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Footer Note */}
//           <Card className="bg-muted/20">
//             <CardContent className="p-6 text-center">
//               <p className="text-sm text-muted-foreground mb-2">
//                 Data updated in real-time • Last updated: {new Date().toLocaleString()}
//               </p>
//               <p className="text-xs text-muted-foreground">
//                 This dashboard promotes transparency in government operations and citizen engagement.
//                 All data is publicly accessible as part of India's Right to Information Act.
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TransparencyDashboard;

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Eye,
  Shield,
} from "lucide-react";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  state: string;
  district: string;
  city: string;
  category: string;
  status: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

interface NationalStats {
  totalComplaints: number;
  pending: number;
  inProgress: number;
  resolved: number;
  activeCities: number;
  activeStates: number;
}

interface StateData {
  state: string;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cities: number;
  trend: string;
  level: "High" | "Moderate" | "Low";
}

interface CityData {
  city: string;
  state: string;
  total: number;
  resolved: number;
  efficiency: number;
}

interface DepartmentStats {
  department: string;
  total: number;
  resolved: number;
  percentage: number;
}

const TransparencyDashboard = () => {
  const [selectedView, setSelectedView] = useState("national");
  const [selectedState, setSelectedState] = useState("all");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
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
  const normalizeStatus = (status: string): "Pending" | "In Progress" | "Resolved" | "Rejected" => {
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

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/api/complaint", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const { complaints } = await response.json();
        setComplaints(complaints);
        // Set last updated timestamp from the most recent complaint
        const latestUpdate = complaints.reduce((latest: string, c: Complaint) =>
          new Date(c.updatedAt) > new Date(latest) ? c.updatedAt : latest, complaints[0]?.updatedAt || new Date().toISOString()
        );
        setLastUpdated(new Date(latestUpdate).toLocaleString());
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load complaints.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [toast]);

  // Derive stats using useMemo
  const [nationalStats, stateData, cityData, departmentStats] = useMemo(() => {
    // National Stats
    const totalComplaints = complaints.length;
    const pending = complaints.filter(c => normalizeStatus(c.status) === "Pending").length;
    const inProgress = complaints.filter(c => normalizeStatus(c.status) === "In Progress").length;
    const resolved = complaints.filter(c => normalizeStatus(c.status) === "Resolved").length;
    const activeStates = [...new Set(complaints.map(c => c.state))].length;
    const activeCities = [...new Set(complaints.map(c => c.city))].length;

    const national: NationalStats = {
      totalComplaints,
      pending,
      inProgress,
      resolved,
      activeCities,
      activeStates,
    };

    // State Data
    const states = [...new Set(complaints.map(c => c.state))];
    const stateStats: StateData[] = states.map(state => {
      const stateComplaints = complaints.filter(c => c.state === state);
      const total = stateComplaints.length;
      const pending = stateComplaints.filter(c => normalizeStatus(c.status) === "Pending").length;
      const inProgress = stateComplaints.filter(c => normalizeStatus(c.status) === "In Progress").length;
      const resolved = stateComplaints.filter(c => normalizeStatus(c.status) === "Resolved").length;
      const cities = [...new Set(stateComplaints.map(c => c.city))].length;
      const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
      // Static trend (since no historical data); assume +5% for demo
      const trend = `+${Math.round(resolutionRate / 10)}%`;
      const level = total > 2000 ? "High" : total > 1000 ? "Moderate" : "Low";
      return { state, total, pending, inProgress, resolved, cities, trend, level };
    }).sort((a, b) => b.total - a.total); // Sort by total complaints

    // City Data
    const cities = [...new Set(complaints.map(c => `${c.city}|${c.state}`))];
    const cityStats: CityData[] = cities.map(cityState => {
      const [city, state] = cityState.split("|");
      const cityComplaints = complaints.filter(c => c.city === city && c.state === state);
      const total = cityComplaints.length;
      const resolved = cityComplaints.filter(c => normalizeStatus(c.status) === "Resolved").length;
      const efficiency = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { city, state, total, resolved, efficiency };
    }).sort((a, b) => b.efficiency - a.total); // Sort by efficiency, then total

    // Department Stats
    const departments = [...new Set(Object.values(categoryToDepartment))];
    const deptStats: DepartmentStats[] = departments.map(department => {
      const deptCategories = Object.keys(categoryToDepartment).filter(
        key => categoryToDepartment[key] === department
      );
      const deptComplaints = complaints.filter(c => deptCategories.includes(c.category));
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => normalizeStatus(c.status) === "Resolved").length;
      const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { department, total, resolved, percentage };
    }).sort((a, b) => b.percentage - a.total); // Sort by percentage, then total

    return [national, stateStats, cityStats, deptStats];
  }, [complaints]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-success";
    if (efficiency >= 60) return "text-warning";
    return "text-destructive";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-destructive";
      case "Moderate":
        return "text-warning";
      case "Low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  // Filter city data based on selected state
  const filteredCityData = selectedState === "all"
    ? cityData
    : cityData.filter(city => city.state.toLowerCase() === selectedState.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-gov-blue-light">
                <Eye className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Public Transparency Dashboard</h1>
            </div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Real-time insights into civic complaint resolution across India.
              Track government responsiveness and efficiency at national, state, and city levels.
            </p>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Shield className="h-4 w-4 mr-2" />
              Open Government Data Initiative
            </Badge>
          </div>

          {/* National Overview */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>National Overview</span>
              </CardTitle>
              <CardDescription>
                Nationwide civic complaint statistics and resolution metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-primary">{nationalStats.totalComplaints.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Complaints</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-success">{nationalStats.resolved.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-accent">{nationalStats.inProgress.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-warning">{nationalStats.pending.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-primary">{nationalStats.activeStates}</p>
                      <p className="text-sm text-muted-foreground">Active States</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-primary">{nationalStats.activeCities}</p>
                      <p className="text-sm text-muted-foreground">Active Cities</p>
                    </div>
                  </div>

                  {/* Resolution Rate */}
                  <div className="mt-6 p-4 bg-success/10 rounded-lg text-center">
                    <p className="text-lg font-medium text-success">
                      National Resolution Rate: {nationalStats.totalComplaints > 0 ? Math.round((nationalStats.resolved / nationalStats.totalComplaints) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Efficiency has improved by 12% compared to last quarter
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="states" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="states">State Performance</TabsTrigger>
              <TabsTrigger value="cities">City Rankings</TabsTrigger>
              <TabsTrigger value="departments">Department Efficiency</TabsTrigger>
            </TabsList>

            {/* State Performance */}
            <TabsContent value="states" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>State-wise Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Complaint resolution statistics across Indian states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : stateData.length === 0 ? (
                    <p className="text-center text-muted-foreground">No state data available.</p>
                  ) : (
                    <div className="space-y-4">
                      {stateData.map((state, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <span className="font-bold text-primary">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{state.state}</h4>
                                <p className="text-sm text-muted-foreground">{state.cities} active cities</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getLevelColor(state.level)}>
                                {state.level} Activity
                              </Badge>
                              <Badge variant="secondary" className="text-success">
                                {state.trend}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="text-center p-2 bg-muted/20 rounded">
                              <p className="font-bold">{state.total.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center p-2 bg-success/10 rounded">
                              <p className="font-bold text-success">{state.resolved.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Resolved</p>
                            </div>
                            <div className="text-center p-2 bg-accent/10 rounded">
                              <p className="font-bold text-accent">{state.inProgress.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                            <div className="text-center p-2 bg-warning/10 rounded">
                              <p className="font-bold text-warning">{state.pending.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Resolution Rate</span>
                              <span className="font-medium">{state.total > 0 ? Math.round((state.resolved / state.total) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-muted/20 rounded-full h-2">
                              <div
                                className="bg-success h-2 rounded-full transition-all duration-500"
                                style={{ width: `${state.total > 0 ? (state.resolved / state.total) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* City Rankings */}
            <TabsContent value="cities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Top Performing Cities</span>
                  </CardTitle>
                  <CardDescription>
                    Cities ranked by complaint resolution efficiency
                  </CardDescription>
                  <div className="space-y-2 mt-4 max-w-xs">
                    <label className="text-sm font-medium">Filter by State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {[...new Set(complaints.map(c => c.state))].map(state => (
                          <SelectItem key={state} value={state.toLowerCase()}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : filteredCityData.length === 0 ? (
                    <p className="text-center text-muted-foreground">No city data available.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredCityData.map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-sm font-bold text-primary">#{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{city.city}</h4>
                              <p className="text-sm text-muted-foreground">{city.state}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-sm font-medium">{city.total.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-success">{city.resolved.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Resolved</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-bold ${getEfficiencyColor(city.efficiency)}`}>
                                {city.efficiency}%
                              </p>
                              <p className="text-xs text-muted-foreground">Efficiency</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Department Efficiency */}
            <TabsContent value="departments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Department Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Efficiency metrics across different government departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : departmentStats.length === 0 ? (
                    <p className="text-center text-muted-foreground">No department data available.</p>
                  ) : (
                    <div className="space-y-4">
                      {departmentStats.map((dept, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Building className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{dept.department}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {dept.resolved.toLocaleString()} of {dept.total.toLocaleString()} resolved
                                </p>
                              </div>
                            </div>
                            <Badge className={`${getEfficiencyColor(dept.percentage)}`} variant="outline">
                              {dept.percentage}% Success Rate
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Resolution Progress</span>
                              <span className="font-medium">{dept.percentage}%</span>
                            </div>
                            <div className="w-full bg-muted/20 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-success to-accent h-3 rounded-full transition-all duration-700"
                                style={{ width: `${dept.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Note */}
          <Card className="bg-muted/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Data updated in real-time • Last updated: {lastUpdated}
              </p>
              <p className="text-xs text-muted-foreground">
                This dashboard promotes transparency in government operations and citizen engagement.
                All data is publicly accessible as part of India's Right to Information Act.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;
