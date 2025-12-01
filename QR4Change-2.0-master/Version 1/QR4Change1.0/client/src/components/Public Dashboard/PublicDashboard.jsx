
import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaEye, FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import { useGetAllComplaintsQuery } from "../../services/userComplaintApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import "./PublicDashboard.css";

const COLORS = ["#0d9488", "#f59e0b", "#10b981", "#ef4444"];

const PublicDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch all complaints
  const { data: complaintsData, isLoading, isError, error } = useGetAllComplaintsQuery();

  // Debug logging
  React.useEffect(() => {
    console.log("Complaints Data:", complaintsData);
    if (isError) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints: " + (error?.data?.message || "Unknown error"), {
        toastId: "fetch-error",
      });
    }
  }, [complaintsData, isError, error]);

  // Get unique cities
  const uniqueCities = useMemo(() => {
    if (!complaintsData?.complaints) return [];
    return [...new Set(complaintsData.complaints.map((c) => c.city || "Unknown"))].sort();
  }, [complaintsData?.complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    if (!complaintsData?.complaints) return [];

    return complaintsData.complaints.filter((complaint) => {
      const title = complaint.title || "";
      const description = complaint.description || "";
      const category = complaint.category || "";
      const location = complaint.location || "";
      const city = complaint.city || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === "all" || city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [complaintsData?.complaints, searchQuery, selectedCity]);

  // Data for visualizations
  const categoryData = useMemo(() => {
    if (!filteredComplaints.length) return [];
    const counts = filteredComplaints.reduce((acc, c) => {
      acc[c.category || "Unknown"] = (acc[c.category || "Unknown"] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }, [filteredComplaints]);

  const statusData = useMemo(() => {
    if (!filteredComplaints.length) return [];
    const counts = filteredComplaints.reduce((acc, c) => {
      acc[c.status || "Unknown"] = (acc[c.status || "Unknown"] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }));
  }, [filteredComplaints]);

  const timeData = useMemo(() => {
    if (!filteredComplaints.length) return [];
    const counts = filteredComplaints.reduce((acc, c) => {
      const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredComplaints]);

  // Heatmap data (by location)
  const heatmapData = useMemo(() => {
    if (!filteredComplaints.length) return [];
    const counts = filteredComplaints.reduce((acc, c) => {
      const location = c.location || "Unknown";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([location, count]) => ({ location, count }));
  }, [filteredComplaints]);

  const handleImageClick = (url) => {
    setShowImageModal(true);
    setImageUrl(url);
  };

  const getHeatmapColor = (count) => {
    if (count >= 5) return "bg-red-500";
    if (count >= 3) return "bg-orange-500";
    if (count >= 1) return "bg-yellow-500";
    return "bg-gray-200";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-teal-600 w-12 h-12 mb-4" aria-hidden="true" />
        <span className="text-xl font-medium text-gray-700">Loading Public Dashboard...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-medium text-red-600 mb-4">
          Failed to load complaints: {error?.data?.message || "Unknown error"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          aria-label="Reload page"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      role="main"
      aria-label="Public Complaint Dashboard"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <header className="header-card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Public Complaint Dashboard</h1>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              aria-label="Search complaints"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="select-field"
            aria-label="Filter by city"
          >
            <option value="all">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Visualizations */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" aria-label="Complaint Visualizations">
        {/* Bar Chart: Complaints by Category */}
        <div className="chart-container">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Status Distribution */}
        <div className="chart-container">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Complaints Over Time */}
        <div className="chart-container lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Complaints Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap: Complaints by Location */}
        <div className="chart-container lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Complaint Density by Location</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-teal-100">
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Location</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Complaint Count</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.length > 0 ? (
                  heatmapData.map(({ location, count }) => (
                    <tr key={location} className={`border-b ${getHeatmapColor(count)} text-white`}>
                      <td className="px-4 py-3">{location}</td>
                      <td className="px-4 py-3">{count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-center text-gray-600">
                      No location data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Complaints List */}
      <section className="complaints-section" aria-label="Complaints List">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Complaints List</h2>
        {filteredComplaints.length === 0 ? (
          <p className="text-center text-gray-600" role="alert">
            No complaints found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-teal-100">
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Location</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">City</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Created</th>
                  <th className="px-4 py-3 text-left text-teal-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint._id}
                    className="border-b hover:bg-teal-50 cursor-pointer"
                    onClick={() => setSelectedComplaint(complaint)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedComplaint(complaint)}
                    aria-label={`View details for ${complaint.title || "Untitled"}`}
                  >
                    <td className="px-4 py-3">{complaint.title || "Untitled"}</td>
                    <td className="px-4 py-3 line-clamp-1">{complaint.description || "N/A"}</td>
                    <td className="px-4 py-3">{complaint.category || "Unknown"}</td>
                    <td className="px-4 py-3">{complaint.status || "Unknown"}</td>
                    <td className="px-4 py-3">{complaint.location || "N/A"}</td>
                    <td className="px-4 py-3">{complaint.city || "N/A"}</td>
                    <td className="px-4 py-3">{formatDate(complaint.createdAt)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <FaEye
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(complaint);
                        }}
                        className="text-teal-600 hover:text-teal-800 cursor-pointer"
                        aria-label="View details"
                      />
                      {complaint.image && (
                        <FaEye
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(complaint.image);
                          }}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          aria-label="View image"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detailed View Modal */}
      {selectedComplaint && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedComplaint(null)}
          role="dialog"
          aria-labelledby="complaint-modal-title"
          aria-modal="true"
        >
          <motion.div
            className="modal-content max-w-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="complaint-modal-title" className="text-xl font-bold text-gray-900">
                {selectedComplaint.title || "Untitled"}
              </h2>
              <FaTimes
                onClick={() => setSelectedComplaint(null)}
                className="cursor-pointer text-gray-600 hover:text-gray-800"
                aria-label="Close complaint modal"
              />
            </div>
            <div className="space-y-4">
              <p><strong>Description:</strong> {selectedComplaint.description || "N/A"}</p>
              <p><strong>Category:</strong> {selectedComplaint.category || "Unknown"}</p>
              <p><strong>Status:</strong> {selectedComplaint.status || "Unknown"}</p>
              <p><strong>Feedback:</strong> {selectedComplaint.feedback || "N/A"}</p>
              <p><strong>Location:</strong> {selectedComplaint.location || "N/A"}</p>
              <p><strong>City:</strong> {selectedComplaint.city || "N/A"}</p>
              <p><strong>Created:</strong> {formatDate(selectedComplaint.createdAt)}</p>
              <p><strong>Updated:</strong> {formatDate(selectedComplaint.updatedAt)}</p>
              {selectedComplaint.image && (
                <img
                  src={selectedComplaint.image}
                  alt={selectedComplaint.title || "Complaint"}
                  className="max-w-full h-auto rounded-lg"
                  onError={() => toast.error("Failed to load image", { toastId: "image-error" })}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowImageModal(false)}
          role="dialog"
          aria-labelledby="image-modal-title"
          aria-modal="true"
        >
          <motion.div
            className="modal-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="image-modal-title" className="text-xl font-bold text-gray-900">
                Complaint Image
              </h2>
              <FaTimes
                onClick={() => setShowImageModal(false)}
                className="cursor-pointer text-gray-600 hover:text-gray-800"
                aria-label="Close image modal"
              />
            </div>
            <img
              src={imageUrl}
              alt="Complaint"
              className="max-w-full h-auto rounded-lg"
              onError={() => toast.error("Failed to load image", { toastId: "image-error" })}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default PublicDashboard;