import React, { useState } from 'react';
import { QrCodeIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface QRCodeGeneratorProps {
  location: string;
  city: string;
  area?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ location, city, area }) => {
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  const generateQRData = () => {
    const data = {
      location,
      city,
      area: area || '',
      timestamp: new Date().toISOString(),
      type: 'complaint_location'
    };
    return JSON.stringify(data);
  };

  const handleGenerateQR = () => {
    const data = generateQRData();
    setQrCodeData(data);
    setShowQR(true);
  };

  const handleCopyData = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast.success('QR data copied to clipboard!');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <QrCodeIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Generate Location QR Code</h3>
        <p className="text-gray-600 mt-2">
          Create a QR code for this location that users can scan to pre-fill complaint forms
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Location Details:</h4>
          <p><span className="font-medium">Location:</span> {location}</p>
          <p><span className="font-medium">City:</span> {city}</p>
          {area && <p><span className="font-medium">Area:</span> {area}</p>}
        </div>

        {!showQR ? (
          <button
            onClick={handleGenerateQR}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Generate QR Code
          </button>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyData}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Copy Data
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Generate New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
