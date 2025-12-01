
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { 
  FaSpinner, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaArrowRight,
  FaQrcode,
  FaBrain,
  FaChartLine,
  FaUsers,
  FaCog
} from "react-icons/fa";
import { useLoginAdminMutation } from "../../services/adminAuthApi";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  // Clear error on input change
  useEffect(() => {
    setError("");
  }, [email, password]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 3000,
        toastId: "email-error",
      });
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.error("Password must be at least 6 characters long", {
        position: "top-right",
        autoClose: 3000,
        toastId: "password-error",
      });
      return;
    }

    try {
      const res = await loginAdmin({ email, password }).unwrap();
      if (res.token) {
        localStorage.setItem("adminToken", res.token);
        toast.success("Logged in successfully!", {
          position: "top-right",
          autoClose: 2000,
          toastId: "login-success",
        });
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      const errorMessage = err?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        toastId: "login-error",
      });
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.2)" },
  };

  return (
    <motion.div
      className="admin-login-container min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <FaShieldAlt className="text-2xl text-yellow-400" />
              <span className="text-white font-semibold">Admin Portal</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Welcome to
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                QR4Change
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Access the powerful admin dashboard to manage complaints, 
              track analytics, and oversee city operations with AI-powered insights.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: <FaChartLine />, text: "Real-time Analytics Dashboard" },
                { icon: <FaUsers />, text: "User Management System" },
                { icon: <FaBrain />, text: "AI-Powered Insights" },
                { icon: <FaCog />, text: "Advanced Configuration" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-white/90"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaShieldAlt className="text-2xl" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
                <p className="text-white/70">Sign in to access your dashboard</p>
              </div>

              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaUser className="label-icon" />
                    Email Address
                  </label>
                  <motion.input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    variants={inputVariants}
                    whileFocus="focus"
                    aria-required="true"
                    aria-describedby="email-error"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <FaLock className="label-icon" />
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-input pr-12"
                      variants={inputVariants}
                      whileFocus="focus"
                      aria-required="true"
                      aria-describedby="password-error"
                    />
                    <motion.button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </motion.button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <motion.a
                    href="#"
                    className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    aria-label="Forgot your password?"
                  >
                    Forgot Password?
                  </motion.a>
                </div>

                {error && (
                  <motion.div
                    className="bg-red-500/20 border border-red-500/30 rounded-lg p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    role="alert"
                  >
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  aria-label="Log in as admin"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaShieldAlt />
                      Sign In
                      <FaArrowRight />
                    </>
                  )}
                  {isLoading ? "Authenticating..." : ""}
                </motion.button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-white/60 text-sm">
                  Secure admin access powered by AI verification
                </p>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
