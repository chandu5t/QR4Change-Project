import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-gray-900 mb-2">Debug Auth State</h3>
      <div className="text-sm space-y-1">
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>error:</strong> {error || 'none'}</p>
        <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>token:</strong> {token ? 'exists' : 'none'}</p>
        <p><strong>userType:</strong> {userType || 'none'}</p>
      </div>
    </div>
  );
};

export default DebugAuth;
