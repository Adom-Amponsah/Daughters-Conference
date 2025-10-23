import React from 'react';
import { Calendar, Mail } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left Pill - Status */}
        <div className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-lg">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
            available for events
          </span>
        </div>

        {/* Center Pill - Logo & Navigation */}
        <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 shadow-lg flex-1 max-w-3xl">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              Events
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              Features
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              About
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              Pricing
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              Contact
            </a>
            <a href="#" className="text-gray-800 hover:text-gray-600 transition font-medium text-sm">
              FAQ
            </a>
          </nav>
        </div>

        {/* Right Pill - Contact */}
        <div className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-lg">
          <Mail className="w-4 h-4 text-gray-800" />
          <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
            support@eventflow.com
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;