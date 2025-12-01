import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserComplaints } from '../../store/slices/complaintSlice';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DebugAuth from '../../components/DebugAuth';
import DebugComplaints from '../../components/DebugComplaints';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { complaints, loading, error } = useSelector((state: RootState) => state.complaints);
  
  console.log('Dashboard - Redux state:', { user, complaints, loading, error });

  useEffect(() => {
    console.log('Dashboard - User:', user);
    if (user?._id) {
      console.log('Dashboard - Fetching complaints for user:', user._id);
      dispatch(fetchUserComplaints(user._id)).catch(error => {
        console.error('Dashboard - Error fetching user complaints:', error);
      });
    } else {
      console.log('Dashboard - No user ID available');
    }
  }, [dispatch, user]);

  // Calculate stats based on fetched user complaints
  const stats = {
    totalComplaints: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  // Get recent complaints (first 6)
  const recentComplaints = complaints.slice(0, 6);

  const quickStats = [
    {
      label: 'My Complaints',
      value: stats.totalComplaints,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/my-complaints'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
  ];

  // Fallback if user is not loaded
  if (!user) {
    console.log('Dashboard - No user, showing loading state');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-4">Loading Dashboard...</h1>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard - Rendering dashboard with user:', user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Debug Auth State */}
      {/* <DebugAuth /> */}
      
      {/* Debug Complaints State */}
      {/* <DebugComplaints /> */}
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your reported civic issues.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800 mt-2 inline-block"
                >
                  View all →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/file-complaint"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="bg-blue-500 p-3 rounded-lg mr-4 group-hover:bg-blue-600 transition-colors">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">File New Complaint</h3>
              <p className="text-sm text-gray-600">Report a new civic issue</p>
            </div>
          </Link>

          <Link
            to="/my-complaints"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="bg-green-500 p-3 rounded-lg mr-4 group-hover:bg-green-600 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Track Complaints</h3>
              <p className="text-sm text-gray-600">Monitor your filed complaints</p>
            </div>
          </Link>

          <Link
            to="/complaints"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="bg-purple-500 p-3 rounded-lg mr-4 group-hover:bg-purple-600 transition-colors">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Explore Issues</h3>
              <p className="text-sm text-gray-600">View issues in your city</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Complaints</h2>
          <Link
            to="/my-complaints"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading your complaints...</span>
          </div>
        ) : complaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
            <p className="text-gray-600 mb-4">
              Start by filing your first complaint to help improve your community.
            </p>
            <Link
              to="/file-complaint"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              File First Complaint
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;