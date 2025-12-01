import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHome, 
  FaChartLine, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaQrcode,
  FaShieldAlt,
  FaBell,
  FaFileAlt,
  FaMapMarkerAlt,
  FaUserCog,
  FaDatabase,
  FaChartBar
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import "./Sidebar.css";

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  userType = "user", 
  userName = "User",
  userRole = "Citizen"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const userMenuItems = [
    { 
      id: "home", 
      label: "Home", 
      icon: FaHome, 
      path: "/", 
      description: "Return to homepage"
    },
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: FaChartLine, 
      path: "/dashboard", 
      description: "View your complaints"
    },
    { 
      id: "submit", 
      label: "Submit Complaint", 
      icon: FaQrcode, 
      path: "/complaint", 
      description: "Report a new issue"
    },
    { 
      id: "public", 
      label: "Public Dashboard", 
      icon: FaChartBar, 
      path: "/public/dashboard", 
      description: "View all complaints"
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: FaBell, 
      path: "/notifications", 
      description: "View your notifications"
    }
  ];

  const adminMenuItems = [
    { 
      id: "admin-dashboard", 
      label: "Admin Dashboard", 
      icon: FaUserCog, 
      path: "/admin/dashboard", 
      description: "Manage complaints"
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: FaChartBar, 
      path: "/admin/analytics", 
      description: "View detailed analytics"
    },
    { 
      id: "users", 
      label: "User Management", 
      icon: FaUsers, 
      path: "/admin/users", 
      description: "Manage users"
    },
    { 
      id: "complaints", 
      label: "All Complaints", 
      icon: FaFileAlt, 
      path: "/admin/complaints", 
      description: "View all complaints"
    },
    { 
      id: "locations", 
      label: "Locations", 
      icon: FaMapMarkerAlt, 
      path: "/admin/locations", 
      description: "Manage locations"
    },
    { 
      id: "database", 
      label: "Database", 
      icon: FaDatabase, 
      path: "/admin/database", 
      description: "Database management"
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: FaCog, 
      path: "/admin/settings", 
      description: "System settings"
    }
  ];

  const menuItems = userType === "admin" ? adminMenuItems : userMenuItems;

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (userType === "admin") {
      localStorage.removeItem("adminToken");
    } else {
      localStorage.removeItem("token");
    }
    navigate("/");
    setIsOpen(false);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${isDark ? 'dark' : ''}`}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <motion.div
              className="brand-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FaQrcode />
            </motion.div>
            <div className="brand-text">
              <h2 className="brand-title">QR4Change</h2>
              <p className="brand-subtitle">Smart City Solutions</p>
            </div>
          </div>
          <motion.button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </motion.button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            <FaShieldAlt />
          </div>
          <div className="user-info">
            <h3 className="user-name">{userName}</h3>
            <p className="user-role">{userRole}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.li
                  key={item.id}
                  className="nav-item"
                  variants={itemVariants}
                  custom={index}
                >
                  <motion.button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={item.description}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="nav-indicator"
                        layoutId="activeIndicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <motion.button
            className="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Logout"
          >
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
