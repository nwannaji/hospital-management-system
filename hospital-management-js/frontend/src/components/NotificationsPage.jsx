import React from 'react';
import { BellIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BellIcon className="w-8 h-8 mr-3 text-yellow-600" />
          Notifications
        </h1>
        <p className="text-gray-600 mt-1">System notifications and alerts</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Notification system coming soon...
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
