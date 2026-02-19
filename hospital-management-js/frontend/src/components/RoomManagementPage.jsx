import React from 'react';
import { BuildingOfficeIcon, HomeIcon } from '@heroicons/react/24/outline';

const RoomManagementPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BuildingOfficeIcon className="w-8 h-8 mr-3 text-green-600" />
          Room Management
        </h1>
        <p className="text-gray-600 mt-1">Assign rooms, wards, and manage hospital facilities</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Room management system coming soon...
        </div>
      </div>
    </div>
  );
};

export default RoomManagementPage;
