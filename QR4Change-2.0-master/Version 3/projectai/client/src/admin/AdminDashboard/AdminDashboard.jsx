import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { 
  FaEye, 
  FaEdit, 
  FaSpinner, 
  FaSearch, 
  FaSort, 
  FaTimes, 
  FaSignOutAlt,
  FaBars,
  FaChartLine,
  FaUsers,
  FaFileAlt,
  FaMapMarkerAlt,
  FaCog,
  FaDatabase,
  FaChartBar,
  FaBell,
  FaFilter,
  FaDownload,
  FaSync,
  FaPlus,
  FaQrcode,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { useGetDepartmentComplaintsQuery, useUpdateComplaintStatusMutation } from "../../services/adminAuthApi";
import { useGetLoggedAdminQuery } from "../../services/adminAuthApi";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: "", feedback: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const complaintsPerPage = 9;

  // Fetch admin data
  const { data: adminData, isLoading: adminLoading } = useGetLoggedAdminQuery(
    localStorage.getItem("adminToken")
  );

  // Fetch complaints
  const {
    data: complaintsData,
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useGetDepartmentComplaintsQuery(localStorage.getItem("adminToken"), {
    skip: !localStorage.getItem("adminToken"),
  });

  const [updateComplaintStatus] = useUpdateComplaintStatusMutation();

  // Filter and sort complaints
  const filteredComplaints = useMemo(() => {
    if (!complaintsData?.complaints) return [];

    let filtered = complaintsData.complaints.filter((complaint) => {
      // Add null checks for all fields
      const title = complaint.title || "";
      const description = complaint.description || "";
      const category = complaint.category || "";
      const userId = complaint.userId || "";
      const status = complaint.status || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesCategory =
        selectedCategory === "all" || category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase() || "";
          bValue = b.title?.toLowerCase() || "";
          break;
        case "category":
          aValue = a.category?.toLowerCase() || "";
          bValue = b.category?.toLowerCase() || "";
          break;
        case "status":
          aValue = a.status?.toLowerCase() || "";
          bValue = b.status?.toLowerCase() || "";
          break;
        case "urgency":
          aValue = a.urgency || "low";
          bValue = b.urgency || "low";
          break;
        case "updatedAt":
        default:
          aValue = new Date(a.updatedAt || 0).getTime();
          bValue = new Date(b.updatedAt || 0).getTime();
          break;
      }
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [complaintsData?.complaints, searchQuery, selectedStatus, selectedCategory, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * complaintsPerPage,
    currentPage * complaintsPerPage
  );

  // Handle status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.status || !selectedComplaint) {
      toast.error("Please select a status", { toastId: "status-update-error" });
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Authentication token missing. Please log in again.", { toastId: "auth-error" });
      return;
    }

    setIsUpdating(true);
    try {
      await updateComplaintStatus({
        complaintId: selectedComplaint._id,
        access_token: token,
        status: updateForm.status,
        feedback: updateForm.feedback,
      }).unwrap();

      toast.success("Complaint status updated successfully!", { toastId: "status-update-success" });
      setSelectedComplaint(null);
      setUpdateForm({ status: "", feedback: "" });
      refetchComplaints();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status", { toastId: "status-update-error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully!", { toastId: "logout-success" });
    window.location.href = "/adim/login";
  };

  // Handle sort
  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  // Handle image modal
  const handleImageClick = (imageUrl) => {
    setShowImageModal(true);
    setImageUrl(imageUrl);
  };

  // Get urgency styling
  const getUrgencyInfo = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return { color: "bg-red-100 text-red-800", icon: "🚨", label: "High" };
      case "medium":
        return { color: "bg-yellow-100 text-yellow-800", icon: "⚠️", label: "Medium" };
      default:
        return { color: "bg-green-100 text-green-800", icon: "ℹ️", label: "Low" };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (adminLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="animate-spin text-teal-600 w-8 h-8" />
        <p className="loading-text">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="admin-dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="main"
      aria-label="Admin Dashboard"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        aria-live="polite"
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userType="admin"
        userName={adminData?.authority?.name || "Admin"}
        userRole="Administrator"
      />

      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        userType="admin"
        userName={adminData?.authority?.name || "Admin"}
        showNotifications={true}
        showUserMenu={true}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Dashboard Header */}
        <motion.div
          className="dashboard-header"
          variants={itemVariants}
        >
          <div className="header-left">
            <h1 className="dashboard-title">
              <FaShieldAlt className="title-icon" />
              Admin Dashboard
            </h1>
            <p className="welcome-text">
              Welcome back, {adminData?.authority?.name || "Admin"}! Managing{" "}
              {adminData?.authority?.city || "Pune"} complaints.
            </p>
          </div>
          <div className="header-actions">
            <motion.button
              className="action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
            </motion.button>
            <motion.button
              className="action-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetchComplaints()}
            >
              <FaSync />
              Refresh
            </motion.button>
            <motion.button
              className="action-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDownload />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="stats-grid"
          variants={containerVariants}
        >
          {[
            { 
              label: "Total Complaints", 
              value: complaintsData?.complaints?.length || 0,
              icon: <FaFileAlt />,
              color: "blue",
              change: "+12%"
            },
            { 
              label: "Pending", 
              value: complaintsData?.complaints?.filter(c => c.status === "pending").length || 0,
              icon: <FaClock />,
              color: "yellow",
              change: "+5%"
            },
            { 
              label: "In Progress", 
              value: complaintsData?.complaints?.filter(c => c.status === "in progress").length || 0,
              icon: <FaExclamationTriangle />,
              color: "orange",
              change: "+8%"
            },
            { 
              label: "Resolved", 
              value: complaintsData?.complaints?.filter(c => c.status === "resolved").length || 0,
              icon: <FaCheckCircle />,
              color: "green",
              change: "+15%"
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`stat-card ${stat.color}`}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-number">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change">{stat.change}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className={`filters-section ${showFilters ? 'expanded' : ''}`}
          variants={itemVariants}
        >
          <div className="filters-container">
            <div className="search-container">
              <FaSearch className="search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search complaints"
              />
            </div>
            <div className="filters-grid">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                <option value="Garbage">Garbage</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Street Light">Street Light</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Other">Other</option>
              </select>
              <div className="view-controls">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  aria-label="Grid view"
                >
                  <FaChartLine />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  aria-label="List view"
                >
                  <FaFileAlt />
                </button>
              </div>
              <div className="sort-container">
                {["urgency", "updatedAt"].map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`sort-btn ${sortBy === field ? "active" : ""}`}
                    aria-label={`Sort by ${field === "urgency" ? "Urgency" : "Date"}`}
                  >
                    {field === "urgency" ? "Urgency" : "Date"}
                    <FaSort className={`sort-icon ${sortOrder === "desc" && sortBy === field ? "rotate-180" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Complaints Section */}
        <motion.section
          className="complaints-section"
          variants={itemVariants}
          aria-label="Complaints list"
        >
          {complaintsLoading ? (
            <div className={`complaints-${viewMode}`}>
              {[...Array(6)].map((_, index) => (
                <div key={index} className="complaint-card animate-pulse">
                  <div className="card-header">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : complaintsError ? (
            <div className="error-container">
              <div className="error-icon">
                <FaExclamationTriangle />
              </div>
              <h3 className="error-title">Failed to load complaints</h3>
              <p className="error-text">
                There was an error loading the complaints data.
              </p>
              <motion.button
                onClick={refetchComplaints}
                className="retry-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSync />
                Retry
              </motion.button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaFileAlt />
              </div>
              <h3 className="empty-title">No complaints found</h3>
              <p className="empty-subtitle">Try adjusting your filters or search terms</p>
              <motion.button
                className="add-complaint-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                Add New Complaint
              </motion.button>
            </div>
          ) : (
            <>
              <div className={`complaints-${viewMode}`}>
                {paginatedComplaints.map((complaint) => {
                  const urgencyInfo = getUrgencyInfo(complaint.urgency);
                  return (
                    <motion.div
                      key={complaint._id}
                      className="complaint-card"
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
                      onClick={() => setSelectedComplaint(complaint)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${complaint.title || "Untitled"}`}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedComplaint(complaint)}
                    >
                      <div className="card-header">
                        <div className="card-title-section">
                          <h3 className="card-title">{complaint.title || "Untitled"}</h3>
                          <span className={`urgency-badge ${urgencyInfo.color}`}>
                            {urgencyInfo.icon} {urgencyInfo.label}
                          </span>
                        </div>
                        <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                          {complaint.status || "Unknown"}
                        </span>
                      </div>
                      <p className="card-description">{complaint.description || "No description available"}</p>
                      <div className="card-meta">
                        <div className="meta-item">
                          <span className="meta-label">Category:</span>
                          <span className="meta-value">{complaint.category || "N/A"}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Location:</span>
                          <span className="meta-value">{complaint.location || "N/A"}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">City:</span>
                          <span className="meta-value">{complaint.city || "N/A"}</span>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="card-date">
                          <FaClock />
                          {formatDate(complaint.updatedAt)}
                        </span>
                        <span className="card-user">
                          <FaUsers />
                          {complaint.userId || "Anonymous"}
                        </span>
                      </div>
                      <div className="card-actions">
                        <motion.button
                          className="action-btn view"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(complaint);
                          }}
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          className="action-btn edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(complaint);
                          }}
                        >
                          <FaEdit />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <motion.div
                  className="pagination"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-pagination"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous page"
                  >
                    Previous
                  </motion.button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-pagination"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next page"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.section>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <motion.div
          className="modal-overlay"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          onClick={() => setSelectedComplaint(null)}
          role="dialog"
          aria-labelledby="complaint-modal-title"
          aria-modal="true"
        >
          <motion.div
            className="complaint-modal"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="complaint-modal-title" className="modal-title">
                {selectedComplaint.title || "Untitled"}
              </h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="modal-close-btn"
                aria-label="Close complaint details"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="complaint-image-section">
                {selectedComplaint.image && (
                  <div className="image-container">
                    <img
                      src={selectedComplaint.image}
                      alt={`Complaint: ${selectedComplaint.title || "Untitled"}`}
                      className="complaint-image"
                      onClick={() => handleImageClick(selectedComplaint.image)}
                      onError={() => toast.error("Failed to load image", { toastId: "image-error" })}
                    />
                  </div>
                )}
              </div>
              <div className="complaint-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{selectedComplaint.category || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-badge ${getStatusClass(selectedComplaint.status)}`}>
                    {selectedComplaint.status || "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Urgency</span>
                  <span className={`detail-value urgency-badge ${getUrgencyInfo(selectedComplaint.urgency).color}`}>
                    {getUrgencyInfo(selectedComplaint.urgency).icon} {getUrgencyInfo(selectedComplaint.urgency).label}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{selectedComplaint.location || "N/A"}, {selectedComplaint.city || "N/A"}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Description</span>
                  <p className="detail-value description-text">{selectedComplaint.description || "No description available"}</p>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Feedback</span>
                  <p className="detail-value">{selectedComplaint.feedback || "No feedback yet"}</p>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{formatDate(selectedComplaint.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Updated</span>
                  <span className="detail-value">{formatDate(selectedComplaint.updatedAt)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <h3 className="update-title">Update Status</h3>
              <form onSubmit={handleStatusUpdate} className="update-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      id="status"
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      required
                      className="form-input"
                      aria-required="true"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="feedback" className="form-label">Feedback</label>
                    <textarea
                      id="feedback"
                      value={updateForm.feedback}
                      onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
                      placeholder="Enter feedback for the user..."
                      className="form-textarea"
                      rows="3"
                      aria-label="Feedback"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="btn-cancel"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!updateForm.status || isUpdating}
                    className="btn-update"
                    aria-label="Update complaint status"
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <motion.div
          className="modal-overlay"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          onClick={() => setShowImageModal(false)}
          role="dialog"
          aria-labelledby="image-modal-title"
          aria-modal="true"
        >
          <motion.div
            className="image-modal"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="image-modal-title" className="modal-title">Complaint Image</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="modal-close-btn"
                aria-label="Close image modal"
              >
                <FaTimes />
              </button>
            </div>
            <div className="image-container">
              <img
                src={imageUrl}
                alt="Complaint image"
                className="complaint-image"
                onError={() => toast.error("Failed to load image", { toastId: "image-error" })}
              />
            </div>
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

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "status-pending";
    case "in progress":
      return "status-progress";
    case "resolved":
      return "status-resolved";
    default:
      return "status-default";
  }
};

export default AdminDashboard;