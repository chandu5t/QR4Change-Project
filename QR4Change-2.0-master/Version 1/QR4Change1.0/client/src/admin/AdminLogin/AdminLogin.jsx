
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { useLoginAdminMutation } from "../../services/adminAuthApi";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      className="admin-login-container min-h-screen bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center p-6"
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
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="admin-login-form bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md z-10"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="form-title text-2xl font-semibold text-teal-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Admin Login
        </motion.h2>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <motion.input
            id="email"
            type="email"
            placeholder="Enter your email"
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
            Password
          </label>
          <motion.input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            variants={inputVariants}
            whileFocus="focus"
            aria-required="true"
            aria-describedby="password-error"
          />
        </div>

        <motion.a
          href="#"
          className="forgot-password text-sm text-teal-600 hover:underline mt-2 inline-block"
          aria-label="Forgot your password?"
        >
          Forgot Password?
        </motion.a>

        {error && (
          <motion.p
            className="error-text text-red-600 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            id="form-error"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          className="btn-admin-login bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 mt-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          aria-label="Log in as admin"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin inline-block mr-2" />
          ) : null}
          {isLoading ? "Logging in..." : "Log In"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default AdminLogin;
