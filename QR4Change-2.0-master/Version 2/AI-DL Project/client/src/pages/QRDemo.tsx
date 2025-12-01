import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCodeIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const QRDemo: React.FC = () => {
  const navigate = useNavigate();
  const [demoLocation, setDemoLocation] = useState('Shivaji Nagar Railway Station');
  const [demoCity, setDemoCity] = useState('Pune');

  const handleDemoComplaint = () => {
    // Navigate to complaint form with pre-filled data
    navigate(`/file-complaint?location=${encodeURIComponent(demoLocation)}&city=${encodeURIComponent(demoCity)}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <QrCodeIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Complaint System Demo</h1>
        <p className="text-gray-600">
          Experience how QR codes can streamline complaint filing with pre-filled location data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How it works */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium">Authorities Generate QR Codes</h3>
                <p className="text-gray-600 text-sm">Municipal authorities create QR codes for specific locations</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium">QR Codes Placed at Locations</h3>
                <p className="text-gray-600 text-sm">QR codes are placed at problem areas (streetlights, potholes, etc.)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium">Citizens Scan QR Codes</h3>
                <p className="text-gray-600 text-sm">Users scan QR codes to automatically pre-fill location data</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-medium">Quick Complaint Filing</h3>
                <p className="text-gray-600 text-sm">Users only need to add description and photo to file complaint</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Try It Out</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Location
              </label>
              <input
                type="text"
                value={demoLocation}
                onChange={(e) => setDemoLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo City
              </label>
              <input
                type="text"
                value={demoCity}
                onChange={(e) => setDemoCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
            </div>
            <button
              onClick={handleDemoComplaint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
            >
              <MapPinIcon className="w-5 h-5 mr-2" />
              File Complaint with Pre-filled Data
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Benefits of QR Code System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
          <div>
            <h4 className="font-medium mb-2">For Citizens:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Faster complaint filing</li>
              <li>• Accurate location data</li>
              <li>• No need to remember exact addresses</li>
              <li>• Reduced form filling time</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Authorities:</h4>
            <ul className="space-y-1 text-sm">
              <li>• More accurate location data</li>
              <li>• Reduced complaint processing time</li>
              <li>• Better resource allocation</li>
              <li>• Improved citizen satisfaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDemo;
