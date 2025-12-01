import React, { useState } from 'react';
import { XMarkIcon, CameraIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [qrData, setQrData] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  const handleManualSubmit = () => {
    if (qrData.trim()) {
      onScan(qrData.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {!isManualMode ? (
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Camera scanning is not available. Please use manual input.
              </p>
              <button
                onClick={() => setIsManualMode(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Enter QR Data Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="qrData" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Data
              </label>
              <textarea
                id="qrData"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Paste QR code data here or enter location manually"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleManualSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Use This Data
              </button>
              <button
                onClick={() => setIsManualMode(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {!isManualMode 
              ? "Camera scanning is not available. Use manual input instead."
              : "Enter the QR code data or location information manually."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;
