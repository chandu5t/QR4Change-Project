import React, { useState } from 'react';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { QrCodeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const QRCodeManagement: React.FC = () => {
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const handleGenerate = () => {
    if (!location || !city) {
      alert('Please fill in location and city');
      return;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Management</h1>
        <p className="text-gray-600">
          Generate QR codes for specific locations to help citizens quickly file complaints with pre-filled location data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <MapPinIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold">Location Details</h2>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Shivaji Nagar Railway Station"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Pune"
                required
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                Area (Optional)
              </label>
              <input
                type="text"
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Shivaji Nagar"
              />
            </div>
          </form>
        </div>

        {/* QR Code Generator */}
        {location && city && (
          <QRCodeGenerator
            location={location}
            city={city}
            area={area}
          />
        )}

        {(!location || !city) && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Location Details</h3>
            <p className="text-gray-600">
              Fill in the location and city details to generate a QR code for this location.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use QR Codes</h3>
        <div className="space-y-2 text-blue-800">
          <p>1. Fill in the location details above</p>
          <p>2. Generate the QR code for the specific location</p>
          <p>3. Print and place the QR code at the physical location</p>
          <p>4. Citizens can scan the QR code to automatically pre-fill location data when filing complaints</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeManagement;
