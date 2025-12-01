import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaBars, FaBell, FaUser, FaCog, FaSignOutAlt, FaQrcode } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationContext";
import ThemeToggle from "./ThemeToggle";
import "./Header.css";

const Header = ({ 
  onMenuClick, 
  userType = "user", 
  userName = "User",
  showNotifications = true,
  showUserMenu = true 
}) => {
  const { isDark } = useTheme();
  const { notifications } = useNotification();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showwNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (userType === "admin") {
      localStorage.removeItem("adminToken");
    } else {
      localStorage.removeItem("token");
    }
    window.location.href = "/";
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.header
      className={`header ${isDark ? 'dark' : ''}`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="header-container">
        {/* Left Section */}
        <div className="header-left">
          <motion.button
            className="menu-btn"
            onClick={onMenuClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open menu"
          >
            <FaBars />
          </motion.button>
          
          <div className="header-brand">
            <motion.div
              className="brand-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FaQrcode />
            </motion.div>
            <div className="brand-text">
              <h1 className="brand-title">QR4Change</h1>
              <p className="brand-subtitle">Smart City Solutions</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Theme Toggle */}
          <div className="header-item">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          {showNotifications && (
            <div className="header-item notification-container">
              <motion.button
                className="notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <motion.span
                    className="notification-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  className="notification-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <span className="notification-count">{notifications.length}</span>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification, index) => (
                        <div
                          key={index}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="dropdown-footer">
                      <button className="view-all-btn">View All</button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* User Menu */}
          {showUserMenu && (
            <div className="header-item user-container">
              <motion.button
                className="user-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="user-role">{userType === "admin" ? "Administrator" : "Citizen"}</span>
                </div>
              </motion.button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <motion.div
                  className="user-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="dropdown-header">
                    <div className="user-profile">
                      <div className="profile-avatar">
                        <FaUser />
                      </div>
                      <div className="profile-info">
                        <h3>{userName}</h3>
                        <p>{userType === "admin" ? "Administrator" : "Citizen"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button className="menu-item">
                      <FaUser />
                      <span>Profile</span>
                    </button>
                    <button className="menu-item">
                      <FaCog />
                      <span>Settings</span>
                    </button>
                    <hr className="menu-divider" />
                    <button className="menu-item logout" onClick={handleLogout}>
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
