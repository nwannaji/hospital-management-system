import React, { useState, useEffect } from 'react';
import { BeakerIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const LaboratoryPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      testType: 'Blood Test',
      testDate: '2025-02-19',
      status: 'Completed',
      results: {
        hemoglobin: '14.2 g/dL',
        wbc: '7.5 × 10^9/L',
        rbc: '4.8 × 10^12/L',
        platelets: '250 × 10^9/L'
      },
      doctor: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      testType: 'Urinalysis',
      testDate: '2025-02-19',
      status: 'In Progress',
      results: {
        color: 'Yellow',
        clarity: 'Clear',
        ph: '6.5',
        protein: 'Trace',
        glucose: 'Negative'
      },
      doctor: 'Dr. Michael Chen'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      testType: 'X-Ray',
      testDate: '2025-02-18',
      status: 'Completed',
      results: {
        findings: 'No acute abnormalities',
        impression: 'Normal chest X-ray',
        radiologist: 'Dr. Emily Davis'
      },
      doctor: 'Dr. Emily Davis'
    }
  ]);

  const [pendingTests, setPendingTests] = useState([
    {
      id: 4,
      patientName: 'Mary Wilson',
      testType: 'MRI Scan',
      scheduledTime: '2025-02-20 14:00',
      priority: 'High',
      notes: 'Contrast agent required'
    },
    {
      id: 5,
      patientName: 'James Brown',
      testType: 'CT Scan',
      scheduledTime: '2025-02-20 15:30',
      priority: 'Medium',
      notes: 'Patient allergic to iodine'
    }
  ]);

  const [labStats, setLabStats] = useState({
    totalTestsToday: 15,
    completedTests: 12,
    pendingTests: 3,
    criticalResults: 2,
    averageTurnaroundTime: '2.5 hours'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewTestRequest = () => {
    console.log('New test request clicked');
    // TODO: Implement new test request modal
  };

  const handleViewAllResults = () => {
    console.log('View all results clicked');
    // TODO: Navigate to detailed results view
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BeakerIcon className="w-8 h-8 mr-3 text-purple-600" />
              Laboratory
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Medical test, Diagnosis and Analysis</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleNewTestRequest}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              New Test Request
            </button>
            <button 
              onClick={handleViewAllResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Results
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BeakerIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tests Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{labStats.totalTestsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{labStats.completedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BeakerIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{labStats.pendingTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <BeakerIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Critical Results</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{labStats.criticalResults}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Results</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Laboratory test results management system coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratoryPage;
