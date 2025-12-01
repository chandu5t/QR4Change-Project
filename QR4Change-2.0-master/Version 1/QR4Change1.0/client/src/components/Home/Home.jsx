
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HeroImage from "../../assets/qr-hero.png"; // Ensure this image exists
import "./Home.css"; // Import custom CSS

export default function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login"); // For citizen login/register
  };

  const handlePublicDashbaord = () => {
    navigate("/public/dashboard"); // For admin login
  };

  // Animation variants for staggered effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      className="home-container min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-teal-200 text-gray-800 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-10 z-0"></div>

      {/* Header */}
      <motion.h1
        className="home-title text-4xl md:text-6xl font-extrabold text-green-800 text-center mb-6 tracking-tight z-10"
        variants={itemVariants}
        role="heading"
        aria-level="1"
      >
        QR4Change: A Smart City Grievance Solution
      </motion.h1>

      {/* Description */}
      <motion.p
        className="home-description text-lg md:text-xl text-center max-w-3xl mx-auto mb-8 leading-relaxed z-10"
        variants={itemVariants}
        role="contentinfo"
      >
        Seamlessly report civic issues in your locality using QR codes placed across the city.{" "}
        <strong className="text-green-600">QR4Change</strong> empowers citizens to raise complaints, track resolutions, and connect with municipal authorities — all with a simple scan.
      </motion.p>

      {/* Hero Image */}
      <motion.img
        src={HeroImage}
        alt="Smart City QR Illustration"
        className="home-image w-full max-w-lg rounded-xl shadow-2xl mb-8 z-10"
        variants={itemVariants}
        loading="lazy"
        whileHover={{ scale: 1.05, rotate: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* CTA Buttons */}
      <motion.div
        className="home-buttons flex flex-col md:flex-row gap-4 mb-8 z-10"
        variants={itemVariants}
      >
        <motion.button
          onClick={handleStart}
          className="btn-primary bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(0, 255, 0, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          aria-label="Report an Issue"
        >
          Report an Issue
        </motion.button>

        <motion.button
          onClick={handlePublicDashbaord}
          className="btn-secondary bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(0, 255, 0, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          aria-label="Report an Issue"
        >
          Public Dashboard
        </motion.button>

      </motion.div>

      {/* Footer */}
      <motion.p
        className="home-footer text-sm md:text-base text-gray-600 mt-8 z-10"
        variants={itemVariants}
      >
        Built for smarter, cleaner, and more responsive cities 🚀
      </motion.p>
    </motion.div>
  );
}
