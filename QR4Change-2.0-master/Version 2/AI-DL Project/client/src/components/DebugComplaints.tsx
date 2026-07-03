import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const DebugComplaints: React.FC = () => {
  const { complaints, loading, error } = useSelector((state: RootState) => state.complaints);

  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-gray-900 mb-2">Debug Complaints State</h3>
      <div className="text-sm space-y-1">
        <p><strong>loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>error:</strong> {error || 'none'}</p>
        <p><strong>complaints count:</strong> {complaints.length}</p>
        <p><strong>complaints:</strong> {JSON.stringify(complaints, null, 2)}</p>
      </div>
    </div>
  );
};

export default DebugComplaints;
