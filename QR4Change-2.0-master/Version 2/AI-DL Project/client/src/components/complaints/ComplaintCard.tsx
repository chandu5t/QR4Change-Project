import React from 'react';
import { Complaint } from '../../types';
import { 
  ClockIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalCircleIcon
} from '@heroicons/react/24/outline';

interface ComplaintCardProps {
  complaint: Complaint;
  showActions?: boolean;
  onStatusUpdate?: (id: string, status: string, feedback?: string) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  complaint, 
  showActions = false,
  onStatusUpdate 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return ClockIcon;
      case 'in-progress': return EllipsisHorizontalCircleIcon;
      case 'resolved': return CheckCircleIcon;
      case 'rejected': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const StatusIcon = getStatusIcon(complaint.status);

  const handleStatusChange = (newStatus: string) => {
    const feedback = window.prompt('Please provide feedback (optional):');
    if (onStatusUpdate) {
      onStatusUpdate(complaint._id, newStatus, feedback || undefined);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{complaint.title}</h3>
        <div className="flex items-center space-x-2 ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {complaint.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">{complaint.description}</p>

      {/* Image */}
      {complaint.imageUrl && (
        <div className="mb-4">
          <img
            src={complaint.imageUrl}
            alt="Complaint"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 mr-2" />
          <span>{complaint.location}, {complaint.city}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
            {complaint.category}
          </span>
          <span className={`text-sm font-medium ${getUrgencyColor(complaint.urgency)}`}>
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
            {complaint.urgency}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Filed: {new Date(complaint.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Feedback */}
      {complaint.feedback && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            <strong>Feedback:</strong> {complaint.feedback}
          </p>
        </div>
      )}

      {/* Actions for Authority */}
      {showActions && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleStatusChange('in-progress')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => handleStatusChange('resolved')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Mark Resolved
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;