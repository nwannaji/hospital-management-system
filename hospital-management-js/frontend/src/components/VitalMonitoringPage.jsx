import React from 'react';
import { HeartIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const VitalMonitoringPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <HeartIcon className="w-8 h-8 mr-3 text-red-600" />
          Vital Monitoring
        </h1>
        <p className="text-gray-600 mt-1">Manages and monitors patients vitals in real-time</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Vital monitoring system coming soon...
        </div>
      </div>
    </div>
  );
};

export default VitalMonitoringPage;
