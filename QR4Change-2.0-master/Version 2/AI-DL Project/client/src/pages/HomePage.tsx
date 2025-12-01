import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  MapIcon,
  LightBulbIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userType = localStorage.getItem('userType');

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Easy Complaint Filing',
      description: 'File complaints with just a few clicks. Upload images and track progress in real-time.',
    },
    {
      icon: MapIcon,
      title: 'Location-Based QR Codes',
      description: 'Scan QR codes at problem locations to auto-populate complaint forms.',
    },
    {
      icon: LightBulbIcon,
      title: 'AI-Powered Validation',
      description: 'Smart image recognition and urgency scoring for efficient complaint processing.',
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Tracking',
      description: 'Monitor complaint status and receive updates throughout the resolution process.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Authority Dashboard',
      description: 'Dedicated portal for authorities to manage and resolve civic issues efficiently.',
    },
    {
      icon: UserGroupIcon,
      title: 'Community Impact',
      description: 'Join thousands of citizens making their cities better, one complaint at a time.',
    },
  ];

  const stats = [
    { label: 'Complaints Resolved', value: '10,000+' },
    { label: 'Active Cities', value: '50+' },
    { label: 'Happy Citizens', value: '25,000+' },
    { label: 'Government Partners', value: '100+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your City with <br />
              <span className="text-yellow-300">QR4Change</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Report civic issues instantly, track progress in real-time, and help build a better community for everyone.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link
                  to="/register"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  to="/authority/register"
                  className="border-2 border-white hover:bg-white hover:text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Join as Authority
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link
                  to={userType === 'authority' ? '/authority/dashboard' : '/dashboard'}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/file-complaint"
                  className="border-2 border-white hover:bg-white hover:text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  File Complaint
                </Link>
                <Link
                  to="/qr-demo"
                  className="border-2 border-yellow-400 hover:bg-yellow-400 hover:text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Try QR Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QR4Change?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with citizen engagement to create lasting change in communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to make your voice heard and create change
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Spot an Issue
              </h3>
              <p className="text-gray-600">
                Notice a civic problem in your area? Scan the QR code or use our app to report it.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                File Complaint
              </h3>
              <p className="text-gray-600">
                Add details, upload photos, and let our AI validate and prioritize your complaint.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor the status of your complaint and see real-time updates until resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens who are already transforming their communities
          </p>
          
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors transform hover:scale-105 inline-block"
            >
              Start Filing Complaints Today
            </Link>
          ) : (
            <Link
              to="/file-complaint"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors transform hover:scale-105 inline-block"
            >
              File Your First Complaint
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;