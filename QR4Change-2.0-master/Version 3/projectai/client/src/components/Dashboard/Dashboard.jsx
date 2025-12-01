import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FaQrcode, 
  FaTimes, 
  FaSignOutAlt, 
  FaSpinner, 
  FaEye, 
  FaBell, 
  FaChartLine, 
  FaFilter, 
  FaSearch, 
  FaPlus, 
  FaSync   // 🔄 replaces FaSync
} from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";
import { useGetLoggedUserQuery } from "../../services/userAuthApi";
import { useGetUserComplaintStatusQuery, useDeleteComplaintMutation } from "../../services/userComplaintApi";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationContext";
import ThemeToggle from "../common/ThemeToggle";
import "./Dashboard.css";


const Dashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const modalRef = useRef(null);
  const confirmModalRef = useRef(null);
  const imageModalRef = useRef(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { addNotification } = useNotification();

  // Fetch user and complaints data
  const { data: userData, error: userError, isLoading: userLoading } = useGetLoggedUserQuery(localStorage.getItem("token"));
  const { data: complaintsData, error: complaintsError, isLoading: complaintsLoading, refetch } = useGetUserComplaintStatusQuery(
    {
      userId: userData?.user?._id,
      access_token: localStorage.getItem("token"),
    },
    { skip: !userData?.user?._id }
  );
  const [deleteComplaint, { isLoading: isDeleting }] = useDeleteComplaintMutation();

  // Handle user fetch errors
  useEffect(() => {
    if (userError) {
      toast.error("Failed to fetch user data.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "user-error",
      });
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [userError, navigate]);

  // Handle complaints fetch errors
  useEffect(() => {
    if (complaintsError) {
      toast.error("Failed to fetch complaints.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "complaints-error",
      });
    }
  }, [complaintsError]);

  // Manage scanner lifecycle
  useEffect(() => {
    if (scanning) {
      startScanner();
    }
    return () => {
      if (scanning) {
        stopScanner();
      }
    };
  }, [scanning]);

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageModalRef.current && !imageModalRef.current.contains(event.target)) {
        setShowImageModal(null);
      } else if (confirmModalRef.current && !confirmModalRef.current.contains(event.target)) {
        setShowConfirmDelete(null);
      } else if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedComplaint(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowImageModal(null);
        setShowConfirmDelete(null);
        setSelectedComplaint(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const startScanner = async () => {
    const config = { fps: 10, qrbox: 250 };
    const qrCodeRegionId = "qr-reader";

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" });
      if (permissionStatus.state === "denied") {
        toast.error("Camera permission denied. Please allow camera access.", {
          position: "top-right",
          autoClose: 3000,
          toastId: "camera-denied",
        });
        setScanning(false);
        return;
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        toast.error("No cameras found on this device.", {
          position: "top-right",
          autoClose: 3000,
          toastId: "no-cameras",
        });
        setScanning(false);
        return;
      }

      await html5QrCodeRef.current.start(
        cameras[0].id || { facingMode: "environment" },
        config,
        (decodedText) => {
          setScanResult(decodedText);
          stopScanner();
          if (isValidUrl(decodedText)) {
            toast.success("QR Code scanned successfully! Redirecting...", {
              position: "top-right",
              autoClose: 3000,
              toastId: "qr-success",
            });
            setTimeout(() => {
              const url = new URL(decodedText);
              if (url.origin === window.location.origin) {
                navigate(url.pathname + url.search + url.hash);
              } else {
                window.location.href = decodedText;
              }
            }, 2000);
          } else {
            toast.error("Scanned QR code is not a valid URL.", {
              position: "top-right",
              autoClose: 3000,
              toastId: "qr-error",
            });
          }
        },
        (error) => console.warn(`QR scan error:`, error)
      );
    } catch (err) {
      console.error("Unable to start scanning:", err.message);
      toast.error("Failed to start scanner.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "scanner-error",
      });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
      toastId: "logout-success",
    });
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const handleDeleteComplaint = async (id) => {
    try {
      await deleteComplaint({ id, access_token: localStorage.getItem("token") }).unwrap();
      toast.success("Complaint deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        toastId: "delete-success",
      });
      setSelectedComplaint(null);
      setShowConfirmDelete(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete complaint.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "delete-error",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter complaints based on search and filters
  const filteredComplaints = complaintsData?.complaints?.filter(complaint => {
    const matchesSearch = complaint.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  // Get unique categories for filter
  const categories = [...new Set(complaintsData?.complaints?.map(c => c.category) || [])];

  // Get status counts for stats
  const statusCounts = {
    total: complaintsData?.complaints?.length || 0,
    pending: complaintsData?.complaints?.filter(c => c.status === "pending").length || 0,
    "in progress": complaintsData?.complaints?.filter(c => c.status === "in progress").length || 0,
    resolved: complaintsData?.complaints?.filter(c => c.status === "resolved").length || 0
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="dashboard-container min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Toast Container */}
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

      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-5 dark:opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Enhanced Navbar */}
      <nav className="relative z-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FaQrcode className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                QR4Change
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart City Dashboard
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications */}
            <motion.button
              className="relative p-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addNotification({
                title: "New Update",
                message: "Your complaint status has been updated",
                type: "info"
              })}
            >
              <FaBell />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </motion.button>

            {/* User Menu */}
            {userData?.user && (
              <div className="relative">
                <motion.button
                  className="flex items-center gap-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-2 text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                  whileHover={{ scale: 1.02 }}
                  aria-label={`User menu for ${userData.user.name}`}
                  aria-expanded={showDropdown}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userData.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{userData.user.name}</span>
                </motion.button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl shadow-xl z-20"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      role="menu"
                    >
                      <div className="p-2" >
                        <button
                          className="flex items-center gap-3 w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/20 rounded-lg transition-colors"
                          onClick={handleLogout}
                          role="menuitem"
                          aria-label="Log out"
                        >
                          <FaSignOutAlt className="text-red-500" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { label: "Total Complaints", value: statusCounts.total, color: "from-blue-500 to-blue-600", icon: <FaChartLine /> },
            { label: "Pending", value: statusCounts.pending, color: "from-yellow-500 to-yellow-600", icon: <FaBell /> },
            { label: "In Progress", value: statusCounts["in progress"], color: "from-orange-500 to-orange-600", icon: <FaSpinner /> },
            { label: "Resolved", value: statusCounts.resolved, color: "from-green-500 to-green-600", icon: <FaEye /> }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaFilter />
              Filters
            </motion.button>

            {/* Add New Complaint */}
            <motion.button
              onClick={() => navigate("/complaint-form")}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus />
              New Complaint
            </motion.button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* QR Scanner Section */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pb-6">
        {!scanning ? (
          <motion.div
            className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-8 text-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <FaQrcode className="text-white text-3xl" onClick={() => setScanning(true)}/>
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Scan QR Code
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Scan a QR code to quickly report an issue in your area
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setScanning(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              aria-label="Start QR code scanning"
            >
              <FaQrcode />
              Start Scanning
            </motion.button>
            
            {scanResult && (
              <motion.div
                className="mt-6 p-4 bg-white/20 dark:bg-gray-700/20 rounded-xl"
                variants={itemVariants}
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Scanned:</p>
                <span className="text-blue-600 dark:text-blue-400 break-all">{scanResult}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-8 text-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
              variants={itemVariants}
              role="heading"
              aria-level="3"
            >
              Scanning QR Code...
            </motion.h3>
            <div id="qr-reader" ref={scannerRef} className="qr-reader mb-6"></div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopScanner}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors duration-300 flex items-center gap-2 mx-auto"
              aria-label="Stop QR code scanning"
            >
              <FaTimes />
              Stop Scanning
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Complaints Section */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pb-8">
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              className="text-2xl font-bold text-gray-900 dark:text-white"
              variants={itemVariants}
              role="heading"
              aria-level="2"
            >
              My Complaints
            </motion.h2>
            <motion.button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-700/20 border border-white/30 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSync />
              Refresh
            </motion.button>
          </div>
          
          {complaintsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading complaints...</span>
            </div>
          ) : filteredComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/20 dark:border-gray-700/20">
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Urgency</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Updated</th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <motion.tr
                      key={complaint._id}
                      className="border-b border-white/10 dark:border-gray-700/10 hover:bg-white/5 dark:hover:bg-gray-700/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedComplaint(complaint)}
                      variants={itemVariants}
                      role="row"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedComplaint(complaint);
                        }
                      }}
                      aria-label={`View details for complaint ${complaint.title}`}
                    >
                      <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">{complaint.title}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{complaint.category}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.status === "resolved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : complaint.status === "in progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            complaint.urgency === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : complaint.urgency === "medium"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {complaint.urgency || "Low"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{formatDate(complaint.updatedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowImageModal(complaint.image);
                            }}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors"
                            aria-label={`View image for complaint ${complaint.title}`}
                          >
                            <FaEye size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirmDelete(complaint._id);
                            }}
                            className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors ${
                              isDeleting && showConfirmDelete === complaint._id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isDeleting && showConfirmDelete === complaint._id}
                            aria-label={`Delete complaint ${complaint.title}`}
                          >
                            {isDeleting && showConfirmDelete === complaint._id ? (
                              <FaSpinner className="animate-spin" size={14} />
                            ) : (
                              <FaTimes size={14} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No complaints found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all" 
                  ? "Try adjusting your filters or search terms"
                  : "You haven't submitted any complaints yet"
                }
              </p>
              <motion.button
                onClick={() => navigate("/complaint-form")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="inline mr-2" />
                Submit Your First Complaint
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="complaint-modal-title"
            aria-modal="true"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              ref={modalRef}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 id="complaint-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                    Complaint Details
                  </h3>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close complaint details"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedComplaint.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                      <p className="text-gray-900 dark:text-white">{selectedComplaint.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedComplaint.status === "resolved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : selectedComplaint.status === "in progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {selectedComplaint.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency</label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedComplaint.urgency === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : selectedComplaint.urgency === "medium"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}
                      >
                        {selectedComplaint.urgency || "Low"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedComplaint.createdAt)}</p>
                    </div> */}
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedComplaint.updatedAt)}</p>
                    </div>
                    {/* <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                      <p className="text-gray-900 dark:text-white">{selectedComplaint.location || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                      <p className="text-gray-900 dark:text-white">{selectedComplaint.city || "N/A"}</p>
                    </div> */}
                  </div>
                </div>
                
                {/* <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white mt-2">{selectedComplaint.description}</p>
                </div> */}
                
                {selectedComplaint.feedback && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</label>
                    <p className="text-gray-900 dark:text-white mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      {selectedComplaint.feedback}
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex flex-wrap gap-3">
                  {selectedComplaint.image && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowImageModal(selectedComplaint.image)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-colors"
                      aria-label={`View image for complaint ${selectedComplaint.title}`}
                    >
                      <FaEye />
                      View Image
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmDelete(selectedComplaint._id)}
                    className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition-colors ${
                      isDeleting && showConfirmDelete === selectedComplaint._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isDeleting && showConfirmDelete === selectedComplaint._id}
                    aria-label={`Delete complaint ${selectedComplaint.title}`}
                  >
                    {isDeleting && showConfirmDelete === selectedComplaint._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTimes />
                    )}
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="confirm-delete-title"
            aria-modal="true"
            onClick={() => setShowConfirmDelete(null)}
          >
            <motion.div
              ref={confirmModalRef}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <FaTimes className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 id="confirm-delete-title" className="text-xl font-bold text-gray-900 dark:text-white">
                    Confirm Delete
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this complaint? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmDelete(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl shadow-md transition-colors"
                    aria-label="Cancel delete complaint"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteComplaint(showConfirmDelete)}
                    className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isDeleting}
                    aria-label="Confirm delete complaint"
                  >
                    {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="image-modal-title"
            aria-modal="true"
            onClick={() => setShowImageModal(null)}
          >
            <motion.div
              ref={imageModalRef}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 id="image-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                    Complaint Image
                  </h3>
                  <button
                    onClick={() => setShowImageModal(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close image modal"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  <img
                    src={showImageModal}
                    alt="Complaint image"
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-lg"
                    onError={() => {
                      toast.error("Failed to load image.", {
                        position: "top-right",
                        autoClose: 3000,
                        toastId: "image-error",
                      });
                      setShowImageModal(null);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
     
    </motion.div>
  );
};

export default Dashboard;
