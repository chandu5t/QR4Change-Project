import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchComplaints, updateComplaint } from '../../store/slices/complaintSlice';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DebugAuth from '../../components/DebugAuth';
import DebugComplaints from '../../components/DebugComplaints';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AuthorityDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { complaints, loading } = useSelector((state: RootState) => state.complaints);
  
  console.log('AuthorityDashboard - Redux state:', { user, complaints, loading });

  useEffect(() => {
    console.log('Authority Dashboard - User:', user);
    if (user) {
      console.log('Authority Dashboard - Fetching complaints');
      dispatch(fetchComplaints()).catch(error => {
        console.error('Authority Dashboard - Error fetching complaints:', error);
      });
    }
  }, [dispatch, user]);

  const handleStatusUpdate = async (id: string, status: string, feedback?: string) => {
    try {
      await dispatch(updateComplaint({ id, data: { status, feedback } })).unwrap();
      toast.success(`Complaint marked as ${status}`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  // Calculate stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const urgencyStats = {
    critical: complaints.filter(c => c.urgency === 'Critical').length,
    high: complaints.filter(c => c.urgency === 'High').length,
    medium: complaints.filter(c => c.urgency === 'Medium').length,
    low: complaints.filter(c => c.urgency === 'Low').length,
  };

  const quickStats = [
    {
      label: 'Total Complaints',
      value: stats.total,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Action',
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

  const priorityComplaints = complaints
    .filter(c => c.status !== 'resolved' && c.status !== 'rejected')
    .sort((a, b) => {
      const urgencyOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
    })
    .slice(0, 6);

  // Fallback if user is not loaded
  if (!user) {
    console.log('AuthorityDashboard - No user, showing loading state');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-4">Loading Authority Dashboard...</h1>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  console.log('AuthorityDashboard - Rendering dashboard with user:', user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Debug Auth State */}
      <DebugAuth />
      
      {/* Debug Complaints State */}
      <DebugComplaints />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authority Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and resolve civic complaints in your jurisdiction
        </p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {user?.name} • {localStorage.getItem('userType') === 'authority' ? 'Authority' : 'User'}
        </div>
      </div>

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
            </div>
          );
        })}
      </div>

      {/* Priority Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Urgency Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Urgency</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">Critical</span>
              <span className="text-lg font-bold text-red-600">{urgencyStats.critical}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-600">High</span>
              <span className="text-lg font-bold text-orange-600">{urgencyStats.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">Medium</span>
              <span className="text-lg font-bold text-yellow-600">{urgencyStats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Low</span>
              <span className="text-lg font-bold text-green-600">{urgencyStats.low}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">In Progress</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Handled</span>
                <span className="text-lg font-bold text-gray-900">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Complaints */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Priority Complaints</h2>
          <a
            href="/authority/complaints"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading complaints...</span>
          </div>
        ) : priorityComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {priorityComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                showActions={true}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">
              No pending complaints at the moment. Great job keeping your jurisdiction clean!
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/authority/complaints"
            className="flex items-center p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors group"
          >
            <div className="bg-blue-500 p-3 rounded-lg mr-4 group-hover:bg-blue-600 transition-colors">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Manage All Complaints</h4>
              <p className="text-sm text-gray-600">View and update all complaints</p>
            </div>
          </a>

          <a
            href="/authority/analytics"
            className="flex items-center p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors group"
          >
            <div className="bg-green-500 p-3 rounded-lg mr-4 group-hover:bg-green-600 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Performance insights and trends</p>
            </div>
          </a>

          <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
            <div className="bg-purple-500 p-3 rounded-lg mr-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Urgent Alerts</h4>
              <p className="text-sm text-gray-600">
                {urgencyStats.critical + urgencyStats.high} high priority items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;