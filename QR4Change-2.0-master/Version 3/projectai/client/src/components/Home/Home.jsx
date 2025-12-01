
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaQrcode, 
  FaChartLine, 
  FaUsers, 
  FaShieldAlt, 
  FaRocket, 
  FaArrowRight, 
  FaStar,
  FaBrain,
  FaMobileAlt,
  FaGlobe,
  FaLock,
  FaCheckCircle,
  FaPlay,
  FaDownload,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaAward,
  FaLightbulb,
  FaCog,
  FaEye,
  FaHandsHelping,
  FaLeaf,
  FaCity
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationContext";
import ThemeToggle from "../common/ThemeToggle";
import HeroImage from "../../assets/qr-hero.png";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("overview");

  const handleStart = () => {
    addNotification({
      title: "Welcome!",
      message: "Let's get started with reporting issues in your city",
      type: "success"
    });
    navigate("/login");
  };

  const handlePublicDashboard = () => {
    navigate("/public/dashboard");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  const handleDemo = () => {
    addNotification({
      title: "Demo Mode",
      message: "Experience our AI-powered complaint system",
      type: "info"
    });
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

  const features = [
    {
      icon: <FaQrcode className="text-2xl" />,
      title: "QR Code Scanning",
      description: "Quick and easy issue reporting with QR codes",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FaBrain className="text-2xl" />,
      title: "AI-Powered Analysis",
      description: "Smart AI verification to prevent fake complaints",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Real-time Tracking",
      description: "Track your complaint status in real-time",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Community Driven",
      description: "Join thousands of citizens making cities better",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <FaMobileAlt className="text-2xl" />,
      title: "Mobile First",
      description: "Optimized for mobile devices and accessibility",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Secure Platform",
      description: "Enterprise-grade security and data protection",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Complaints Resolved", icon: <FaCheckCircle /> },
    { number: "50+", label: "Cities Connected", icon: <FaCity /> },
    { number: "95%", label: "User Satisfaction", icon: <FaStar /> },
    { number: "24/7", label: "AI Monitoring", icon: <FaBrain /> }
  ];

  const technologies = [
    { name: "React.js", description: "Modern UI Framework", icon: "⚛️" },
    { name: "Node.js", description: "Backend Runtime", icon: "🟢" },
    { name: "AI/ML", description: "Smart Analytics", icon: "🤖" },
    { name: "MongoDB", description: "Database System", icon: "🍃" },
    { name: "Cloudinary", description: "Image Processing", icon: "☁️" },
    { name: "Django", description: "Python Framework", icon: "🐍" }
  ];

  const projectSections = [
    {
      id: "overview",
      title: "Project Overview",
      content: "QR4Change is a revolutionary smart city platform that leverages AI and QR code technology to streamline civic issue reporting and resolution."
    },
    {
      id: "features",
      title: "Key Features",
      content: "Our platform offers comprehensive features including AI-powered verification, real-time tracking, mobile optimization, and community engagement tools."
    },
    {
      id: "technology",
      title: "Technology Stack",
      content: "Built with modern technologies including React.js, Node.js, AI/ML models, and cloud infrastructure for scalability and performance."
    },
    {
      id: "impact",
      title: "Social Impact",
      content: "Empowering citizens to actively participate in city governance while providing authorities with data-driven insights for better decision making."
    }
  ];

  return (
    <motion.div
      className="home-container min-h-screen relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/city.png')] opacity-5 dark:opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Theme Toggle */}
      <motion.div
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ThemeToggle />
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full p-1">
          {projectSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === section.id
                  ? 'bg-white/20 dark:bg-gray-700/20 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/10'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <FaStar className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Smart City Solution
            </span>
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6"
            variants={itemVariants}
            role="heading"
            aria-level="1"
          >
            QR4Change
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
            variants={itemVariants}
          >
            Transform your city with AI-powered civic issue reporting. 
            <span className="text-blue-600 dark:text-blue-400 font-semibold"> Scan, Report, Track</span> — 
            all in one seamless experience.
          </motion.p>

          {/* Project Info Section */}
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            variants={itemVariants}
          >
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {projectSections.find(s => s.id === activeTab)?.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {projectSections.find(s => s.id === activeTab)?.content}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Image with Enhanced Styling */}
        <motion.div
          className="relative mb-16"
          variants={itemVariants}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-20"></div>
            <motion.img
              src={HeroImage}
              alt="Smart City QR Illustration"
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl"
              loading="lazy"
              whileHover={{ rotate: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 w-full max-w-4xl"
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 text-center"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 w-full max-w-6xl"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 text-center"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="w-full max-w-4xl mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl p-4 text-center"
                whileHover={{ y: -3, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{tech.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleStart}
            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Report an Issue"
          >
            <FaQrcode />
            Report an Issue
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={handlePublicDashboard}
            className="group relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20 text-gray-900 dark:text-white font-semibold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="View Public Dashboard"
          >
            <FaChartLine />
            Public Dashboard
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={handleDemo}
            className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Try Demo"
          >
            <FaPlay />
            Try Demo
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          variants={itemVariants}
        >
          <motion.p
            className="text-gray-600 dark:text-gray-400 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            Built for smarter, cleaner, and more responsive cities 🚀
          </motion.p>
          
          {/* Social Links */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.a
              href="#"
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="GitHub"
            >
              <FaGithub />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="Twitter"
            >
              <FaTwitter />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              whileHover={{ scale: 1.1, y: -2 }}
              aria-label="Email"
            >
              <FaEnvelope />
            </motion.a>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span>Powered by AI</span>
            <span>•</span>
            <span>Real-time Updates</span>
            <span>•</span>
            <span>Community Driven</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
