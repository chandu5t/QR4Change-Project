import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchComplaints, updateComplaint } from '../../store/slices/complaintSlice';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AuthorityComplaints: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { complaints, loading } = useSelector((state: RootState) => state.complaints);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const handleStatusUpdate = async (id: string, status: string, feedback?: string) => {
    try {
      await dispatch(updateComplaint({ id, data: { status, feedback } })).unwrap();
      toast.success(`Complaint marked as ${status}`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  // Apply filters and search
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || complaint.urgency === urgencyFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency;
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
      case 'status':
        const statusOrder = { 'pending': 4, 'in-progress': 3, 'resolved': 2, 'rejected': 1 };
        return statusOrder[b.status as keyof typeof statusOrder] - statusOrder[a.status as keyof typeof statusOrder];
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    'in-progress': complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Complaints</h1>
        <p className="text-gray-600">
          Review and update the status of complaints in your jurisdiction.
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
        <div className="flex flex-col lg:flex-row gap-4">
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

          <div className="flex flex-col md:flex-row gap-4">
            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

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
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Showing {sortedComplaints.length} of {complaints.length} complaints
            {searchTerm && <span> matching "{searchTerm}"</span>}
            {statusFilter !== 'all' && <span> with status "{statusFilter}"</span>}
            {urgencyFilter !== 'all' && <span> with urgency "{urgencyFilter}"</span>}
          </p>
        </div>
      )}

      {/* Complaints Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading complaints...</span>
        </div>
      ) : sortedComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              showActions={true}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
              ? 'No complaints match your filters' 
              : 'No complaints assigned yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Complaints will appear here once they are assigned to your jurisdiction.'
            }
          </p>
        </div>
      )}

      {/* Action Summary */}
      {complaints.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Management Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
              <div className="text-sm text-gray-600">Total Assigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <div className="text-sm text-gray-600">Need Action</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {complaints.length > 0 ? Math.round((statusCounts.resolved / complaints.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityComplaints;