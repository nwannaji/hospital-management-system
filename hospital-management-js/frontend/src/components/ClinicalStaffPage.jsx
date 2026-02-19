import React from 'react';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const ClinicalStaffPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <UserIcon className="w-8 h-8 mr-3 text-blue-600" />
          Clinical Staff Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage hospital staff, schedules, and permissions</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Staff management system coming soon...
        </div>
      </div>
    </div>
  );
};

export default ClinicalStaffPage;
