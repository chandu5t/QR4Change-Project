
import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useRegisterUserMutation } from "../../services/userAuthApi";
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    tc: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email format");
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.tc) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    try {
      const res = await registerUser(formData).unwrap();
      if (res.status === "success") {
        toast.success(res.message || "Registered successfully 🎉");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(res.message || "Registration failed ❌");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed ❌");
    }
  };

  // Animation variants for staggered effects
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="signup-container min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-200 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

      <motion.div
        className="signup-card bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center z-10"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="signup-title text-3xl font-extrabold text-blue-600 mb-6"
          variants={itemVariants}
          role="heading"
          aria-level="2"
        >
          QR4Change - Sign Up
        </motion.h2>

        {error && (
          <motion.p
            className="text-red-500 text-sm mb-4"
            variants={itemVariants}
            role="alert"
          >
            {error?.data?.message || "An error occurred"}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="signup-form flex flex-col gap-4">
          <motion.div variants={itemVariants}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="signup-input w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              aria-label="Full Name"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="signup-input w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              aria-label="Email address"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="signup-input w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="signup-input w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                aria-label="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              name="tc"
              checked={formData.tc}
              onChange={handleChange}
              required
              className="mr-2"
              aria-label="Agree to terms and conditions"
            />
            I agree to the terms and conditions
          </motion.div>

          <motion.button
            type="submit"
            className="signup-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 0, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            aria-label="Sign Up"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <motion.p
          className="signup-footer mt-4 text-sm text-gray-600"
          variants={itemVariants}
        >
          Already have an account?{" "}
          <a href="/login" className="signup-link text-blue-500 hover:underline">
            Sign In
          </a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;
