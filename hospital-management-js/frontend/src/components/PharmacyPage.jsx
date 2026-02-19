import React from 'react';
import { ShoppingBagIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const PharmacyPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ShoppingBagIcon className="w-8 h-8 mr-3 text-purple-600" />
          Pharmacy Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manages purchase, sales and distribution of drugs in hospital</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Pharmacy management system coming soon...
        </div>
      </div>
    </div>
  );
};

export default PharmacyPage;
