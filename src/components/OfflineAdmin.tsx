import React, { useState, useEffect } from 'react';
import { Download, Trash2, Users, Wifi, WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { 
  getOfflineRegistrations, 
  exportToExcel, 
  clearOfflineData,
  type RegistrationData 
} from '../lib/offlineStorage';

export const OfflineAdmin: React.FC = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadRegistrations = () => {
    setRegistrations(getOfflineRegistrations());
  };

  useEffect(() => {
    loadRegistrations();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleExport = () => {
    const result = exportToExcel();
    if (result?.success) {
      alert(`✅ Excel exported: ${result.fileName}`);
    } else {
      alert('❌ Export failed');
    }
  };

  const handleClearData = () => {
    if (confirm('⚠️ Are you sure you want to delete ALL offline registrations? This cannot be undone!')) {
      const result = clearOfflineData();
      if (result.success) {
        setRegistrations([]);
        alert('✅ All offline data cleared');
      } else {
        alert('❌ Failed to clear data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          {/* Mobile Header - Stacked */}
          <div className="block md:hidden">
            {/* Top Row - Back Button and Title */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
              
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-600">Offline Registrations</p>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            {/* Bottom Row - Action Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={loadRegistrations}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors whitespace-nowrap text-sm"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
              
              {registrations.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors whitespace-nowrap text-sm"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                  
                  <button
                    onClick={handleClearData}
                    className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors whitespace-nowrap text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Desktop Header - Original Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Registration Admin</h1>
                <p className="text-gray-600">Manage offline registrations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={loadRegistrations}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                
                {registrations.length > 0 && (
                  <>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Excel
                    </button>
                    
                    <button
                      onClick={handleClearData}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Registrations</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{registrations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">GRM Members</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.isGrmMember).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Want to Exhibit</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.wantsToExhibit).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Offline Registrations</h2>
          </div>
          
          {registrations.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-sm md:text-base text-gray-600">Offline registrations will appear here</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{registration.fullName}</h3>
                          <p className="text-xs text-gray-500">{registration.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-900">{registration.phoneNumber}</p>
                          <p className="text-xs text-gray-500">Age: {registration.age}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {registration.isGrmMember ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              GRM: {registration.grmBranch}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {registration.churchName}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          {registration.wantsToExhibit ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Exhibitor
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Attendee
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Registered: {new Date(registration.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name & Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone & Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Church/GRM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exhibition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{registration.phoneNumber}</div>
                          <div className="text-sm text-gray-500">Age: {registration.age}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.isGrmMember ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                GRM: {registration.grmBranch}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {registration.churchName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.wantsToExhibit ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
