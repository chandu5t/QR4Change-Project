import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaQrcode, FaTimes, FaSignOutAlt, FaSpinner, FaEye } from "react-icons/fa";
import { Html5Qrcode } from "html5-qrcode";
import { useGetLoggedUserQuery } from "../../services/userAuthApi";
import { useGetUserComplaintStatusQuery, useDeleteComplaintMutation } from "../../services/userComplaintApi";
import "./Dashboard.css";

const Dashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const modalRef = useRef(null);
  const confirmModalRef = useRef(null);
  const imageModalRef = useRef(null);
  const navigate = useNavigate();

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
      className="dashboard-container min-h-screen bg-gradient-to-br from-teal-100 to-green-100 flex flex-col"
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

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-10 z-0"></div>

      {/* Navbar */}
      <nav className="dashboard-navbar bg-teal-700 text-white p-4 flex justify-between items-center shadow-xl z-10">
        <motion.h1
          className="dashboard-title text-2xl font-extrabold flex items-center gap-2"
          variants={itemVariants}
          role="heading"
          aria-level="1"
        >
          <span className="text-green-300">🌱</span> QR4Change
        </motion.h1>
        {userData?.user && (
          <div className="relative">
            <motion.button
              className="dashboard-user flex items-center gap-2 text-lg bg-teal-600 px-3 py-2 rounded-lg hover:bg-teal-800 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              whileHover={{ scale: 1.05 }}
              aria-label={`User menu for ${userData.user.name}`}
              aria-expanded={showDropdown}
            >
              <span className="font-medium">Hello, {userData.user.name}</span>
            </motion.button>
            {showDropdown && (
              <motion.div
                className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                role="menu"
              >
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-teal-100"
                  onClick={handleLogout}
                  role="menuitem"
                  aria-label="Log out"
                >
                  <FaSignOutAlt /> Log Out
                </button>
              </motion.div>
            )}
          </div>
        )}
      </nav>

      {/* Main Section */}
      <div className="dashboard-main flex-grow flex flex-col items-center justify-center p-6">
        {!scanning ? (
          <motion.div
            className="dashboard-card bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center z-10"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setScanning(true)}
              className="scan-button bg-teal-600 hover:bg-teal-700 text-white font-semibold p-4 rounded-full flex items-center justify-center mx-auto shadow-lg transition-colors duration-300"
              aria-label="Start QR code scanning"
            >
              <FaQrcode size={32} />
            </motion.button>
            {scanResult && (
              <motion.div
                className="scan-result mt-4 text-teal-600"
                variants={itemVariants}
              >
                <p className="font-medium">Last Scanned:</p>
                <span className="scan-url text-gray-700 break-all">{scanResult}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="scanner-box bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center z-10"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              className="scanner-title text-lg font-semibold text-teal-600 mb-4"
              variants={itemVariants}
              role="heading"
              aria-level="3"
            >
              Scanning...
            </motion.h3>
            <div id="qr-reader" ref={scannerRef} className="qr-reader"></div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopScanner}
              className="stop-button bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 flex items-center gap-2 mx-auto shadow-md transition-colors duration-300"
              aria-label="Stop QR code scanning"
            >
              <FaTimes /> Stop Scanning
            </motion.button>
          </motion.div>
        )}

        {/* Complaints Section */}
        <motion.div
          className="complaints-section bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl mt-8 z-10"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-2xl font-semibold text-teal-600 mb-6"
            variants={itemVariants}
            role="heading"
            aria-level="2"
          >
            My Complaints
          </motion.h2>
          {complaintsLoading ? (
            <p className="text-gray-600 text-center">Loading complaints...</p>
          ) : complaintsData?.success && complaintsData.complaints?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-teal-100">
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Urgency</th>
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Updated</th>
                    <th className="px-4 py-3 text-left text-teal-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaintsData.complaints.map((complaint) => (
                    <motion.tr
                      key={complaint._id}
                      className="border-b hover:bg-teal-50 cursor-pointer"
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
                      <td className="px-4 py-3 text-gray-700">{complaint.title}</td>
                      <td className="px-4 py-3 text-gray-700">{complaint.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.status === "resolved"
                              ? "bg-green-200 text-green-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{complaint.urgency || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(complaint.updatedAt)}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(complaint.image);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg shadow-md"
                          aria-label={`View image for complaint ${complaint.title}`}
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfirmDelete(complaint._id);
                          }}
                          className={`bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg shadow-md ${
                            isDeleting && showConfirmDelete === complaint._id ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isDeleting && showConfirmDelete === complaint._id}
                          aria-label={`Delete complaint ${complaint.title}`}
                        >
                          {isDeleting && showConfirmDelete === complaint._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center">No complaints found.</p>
          )}
        </motion.div>

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="complaint-modal-title"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              className="complaint-modal bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-teal-200"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 id="complaint-modal-title" className="text-xl font-semibold text-teal-600 mb-4">
                Complaint Details
              </h3>
              <div className="space-y-3 text-left">
                <p className="text-sm">
                  <strong className="text-teal-600">ID:</strong> <span className="text-gray-700">{selectedComplaint._id}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Title:</strong> <span className="text-gray-700">{selectedComplaint.title}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Category:</strong> <span className="text-gray-700">{selectedComplaint.category}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Status:</strong>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedComplaint.status === "resolved"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {selectedComplaint.status}
                  </span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Feedback:</strong>{" "}
                  <span className="text-gray-700">{selectedComplaint.feedback || "N/A"}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Urgency:</strong>{" "}
                  <span className="text-gray-700">{selectedComplaint.urgency || "N/A"}</span>
                </p>
                <p className="text-sm">
                  <strong className="text-teal-600">Updated:</strong>{" "}
                  <span className="text-gray-700">{formatDate(selectedComplaint.updatedAt)}</span>
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowImageModal(selectedComplaint.image)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md"
                  aria-label={`View image for complaint ${selectedComplaint.title}`}
                >
                  <FaEye /> View Image
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmDelete(selectedComplaint._id)}
                  className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md ${
                    isDeleting && showConfirmDelete === selectedComplaint._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isDeleting && showConfirmDelete === selectedComplaint._id}
                  aria-label={`Delete complaint ${selectedComplaint.title}`}
                >
                  {isDeleting && showConfirmDelete === selectedComplaint._id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedComplaint(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md"
                  aria-label="Close complaint details"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="confirm-delete-title"
            aria-modal="true"
          >
            <motion.div
              ref={confirmModalRef}
              className="confirm-modal bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-teal-200"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 id="confirm-delete-title" className="text-xl font-semibold text-teal-600 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this complaint?
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteComplaint(showConfirmDelete)}
                  className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isDeleting}
                  aria-label="Confirm delete complaint"
                >
                  {isDeleting ? <FaSpinner className="animate-spin" /> : "Confirm"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmDelete(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md"
                  aria-label="Cancel delete complaint"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-labelledby="image-modal-title"
            aria-modal="true"
          >
            <motion.div
              ref={imageModalRef}
              className="image-modal bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-teal-200"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 id="image-modal-title" className="text-xl font-semibold text-teal-600 mb-4">
                Complaint Image
              </h3>
              <div className="image-container">
                <img
                  src={showImageModal}
                  alt="Complaint image"
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
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
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowImageModal(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg shadow-md"
                  aria-label="Close image modal"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
