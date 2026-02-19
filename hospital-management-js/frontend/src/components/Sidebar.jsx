import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  ShoppingBagIcon,
  HeartIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  try {
    const { theme, toggleTheme, isDark } = useTheme();
    
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <SunIcon className="w-5 h-5 text-yellow-500" />
        ) : (
          <MoonIcon className="w-5 h-5 text-gray-700" />
        )}
      </button>
    );
  } catch (error) {
    // Fallback if theme context is not available
    return (
      <button
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-label="Toggle theme"
        disabled
      >
        <MoonIcon className="w-5 h-5 text-gray-700" />
      </button>
    );
  }
};

const Sidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
      description: 'Displays info'
    },
    {
      title: 'Patients',
      icon: UserGroupIcon,
      path: '/patients',
      description: 'Register, manage new and existing patients'
    },
    {
      title: 'Appointments',
      icon: CalendarIcon,
      path: '/appointments',
      description: 'Manage new and existing patients appointments with hospital'
    },
    {
      title: 'Clinical Staff',
      icon: UserIcon,
      path: '/staff',
      description: 'Staff Management'
    },
    {
      title: 'Medical Records',
      icon: ClipboardDocumentListIcon,
      path: '/medical-records',
      description: 'New and existing patients personal and medical records'
    },
    {
      title: 'Emergency',
      icon: HomeIcon,
      path: '/emergency',
      description: 'Emergency wards and beds for emergency patients'
    },
    {
      title: 'Laboratory',
      icon: BeakerIcon,
      path: '/laboratory',
      description: 'Medical test, Diagnosis and Analysis'
    },
    {
      title: 'Departments',
      icon: BuildingOffice2Icon,
      path: '/departments',
      description: 'Manage rooms, wards and beds for both clinical staff and patients'
    },
    {
      title: 'Room Management',
      icon: BuildingOfficeIcon,
      path: '/rooms',
      description: 'Assigns rooms, wards'
    },
    {
      title: 'Pharmacy',
      icon: ShoppingBagIcon,
      path: '/pharmacy',
      description: 'Manages purchase, sales and distribution of drugs in hospital'
    },
    {
      title: 'Vital Monitoring',
      icon: HeartIcon,
      path: '/vital-monitoring',
      description: 'Manages and monitors patients vitals'
    },
    {
      title: 'Reports & Analysis',
      icon: ChartBarIcon,
      path: '/reports',
      description: 'General reports and graphical analytics of activities going on in hospital'
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      path: '/notifications',
      description: 'System notifications and alerts'
    },
    {
      title: 'Settings',
      icon: CogIcon,
      path: '/settings',
      description: 'System settings and preferences'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hospital Management</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Robust General Hospital</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200" />
                <div className="flex-1">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs opacity-75 mt-1">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">Dr. Sarah Johnson</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
      </div>
    </div>
  );
};

export default Sidebar;
