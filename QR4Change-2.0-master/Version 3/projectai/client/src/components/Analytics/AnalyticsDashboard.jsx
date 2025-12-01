import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaChartPie, 
  FaChartBar, 
  FaTrendingUp, 
  FaTrendingDown,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AnalyticsDashboard = ({ complaints = [] }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Process data for analytics
  const analyticsData = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = timeRanges[timeRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredComplaints = complaints.filter(complaint => 
      new Date(complaint.createdAt) >= startDate
    );

    // Status distribution
    const statusData = filteredComplaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryData = filteredComplaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {});

    // Time series data
    const timeSeriesData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayComplaints = filteredComplaints.filter(complaint => {
        const complaintDate = new Date(complaint.createdAt);
        return complaintDate.toDateString() === date.toDateString();
      });
      
      timeSeriesData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        complaints: dayComplaints.length,
        resolved: dayComplaints.filter(c => c.status === 'resolved').length,
        pending: dayComplaints.filter(c => c.status === 'pending').length
      });
    }

    // Urgency distribution
    const urgencyData = filteredComplaints.reduce((acc, complaint) => {
      const urgency = complaint.urgency || 'low';
      acc[urgency] = (acc[urgency] || 0) + 1;
      return acc;
    }, {});

    // Location hotspots
    const locationData = filteredComplaints.reduce((acc, complaint) => {
      const location = complaint.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    return {
      total: filteredComplaints.length,
      resolved: statusData.resolved || 0,
      pending: statusData.pending || 0,
      inProgress: statusData['in progress'] || 0,
      statusData: Object.entries(statusData).map(([name, value]) => ({ name, value })),
      categoryData: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
      urgencyData: Object.entries(urgencyData).map(([name, value]) => ({ name, value })),
      timeSeriesData,
      locationData: Object.entries(locationData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }))
    };
  }, [complaints, timeRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const metrics = [
    {
      title: 'Total Complaints',
      value: analyticsData.total,
      change: '+12%',
      trend: 'up',
      icon: <FaChartLine className="text-blue-500" />,
      color: 'blue'
    },
    {
      title: 'Resolved',
      value: analyticsData.resolved,
      change: '+8%',
      trend: 'up',
      icon: <FaCheckCircle className="text-green-500" />,
      color: 'green'
    },
    {
      title: 'Pending',
      value: analyticsData.pending,
      change: '-5%',
      trend: 'down',
      icon: <FaClock className="text-yellow-500" />,
      color: 'yellow'
    },
    {
      title: 'In Progress',
      value: analyticsData.inProgress,
      change: '+15%',
      trend: 'up',
      icon: <FaSpinner className="text-orange-500" />,
      color: 'orange'
    }
  ];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights and trends for your complaints
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-xl flex items-center justify-center`}>
                {metric.icon}
              </div>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' ? (
                  <FaTrendingUp className="text-green-500" />
                ) : (
                  <FaTrendingDown className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {metric.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Series Chart */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Complaints Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="complaints" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Complaints by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Location Hotspots */}
        <motion.div
          className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Location Hotspots
          </h3>
          <div className="space-y-3">
            {analyticsData.locationData.map((item, index) => (
              <div key={item.location} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400 text-sm" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.count / Math.max(...analyticsData.locationData.map(l => l.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
