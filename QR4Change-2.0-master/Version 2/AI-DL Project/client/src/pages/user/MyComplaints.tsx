import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserComplaints } from '../../store/slices/complaintSlice';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DebugComplaints from '../../components/DebugComplaints';
import { 
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MyComplaints: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { complaints, loading } = useSelector((state: RootState) => state.complaints);
  
  console.log('MyComplaints - Redux state:', { user, complaints, loading });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user?._id) {
      console.log('MyComplaints - Fetching user complaints for:', user._id);
      dispatch(fetchUserComplaints(user._id));
    }
  }, [dispatch, user]);

  // Filter user's complaints
  const userComplaints = complaints.filter(complaint => complaint.userId === user?._id);
  console.log('MyComplaints - All complaints:', complaints);
  console.log('MyComplaints - User complaints:', userComplaints);
  console.log('MyComplaints - User ID:', user?._id);
  
  // If no user complaints found, show all complaints (for debugging)
  const displayComplaints = userComplaints.length > 0 ? userComplaints : complaints;
  console.log('MyComplaints - Display complaints:', displayComplaints);

  // Apply filters and search
  const filteredComplaints = displayComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'urgency':
        const urgencyOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: displayComplaints.length,
    pending: displayComplaints.filter(c => c.status === 'pending').length,
    'in-progress': displayComplaints.filter(c => c.status === 'in-progress').length,
    resolved: displayComplaints.filter(c => c.status === 'resolved').length,
    rejected: displayComplaints.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Debug Complaints State */}
      {/* <DebugComplaints /> */}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Complaints</h1>
        <p className="text-gray-600">
          Track the status and progress of all your filed complaints.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-200">
          {[
            { key: 'all', label: 'All', color: 'text-gray-900' },
            { key: 'pending', label: 'Pending', color: 'text-yellow-600' },
            { key: 'in-progress', label: 'In Progress', color: 'text-blue-600' },
            { key: 'resolved', label: 'Resolved', color: 'text-green-600' },
            { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              className={`p-4 text-center hover:bg-gray-50 transition-colors ${
                statusFilter === status.key ? 'bg-blue-50 border-b-2 border-blue-500' : ''
              }`}
            >
              <div className={`font-semibold text-lg ${status.color}`}>
                {statusCounts[status.key as keyof typeof statusCounts]}
              </div>
              <div className="text-sm text-gray-600">{status.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="urgency">By Urgency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading your complaints...</span>
        </div>
      ) : sortedComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'No complaints match your filters' 
              : 'No complaints filed yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by filing your first complaint to help improve your community.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => window.location.href = '/file-complaint'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              File Your First Complaint
            </button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {displayComplaints.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Impact Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{displayComplaints.length}</div>
              <div className="text-sm text-gray-600">Total Filed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round((statusCounts.resolved / displayComplaints.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(displayComplaints.map(c => c.city))].length}
              </div>
              <div className="text-sm text-gray-600">Cities Helped</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;