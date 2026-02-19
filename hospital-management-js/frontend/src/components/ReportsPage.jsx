import React from 'react';
import { ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="w-8 h-8 mr-3 text-indigo-600" />
          Reports & Analysis
        </h1>
        <p className="text-gray-600 mt-1">General reports and graphical analytics of hospital activities</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Reports and analytics system coming soon...
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
