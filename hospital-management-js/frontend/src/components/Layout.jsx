import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon, current: false },
  { name: 'Appointments', href: '/appointments', icon: CalendarIcon, current: false },
  { name: 'Doctors', href: '/doctors', icon: UserGroupIcon, current: false },
  { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, current: false },
  { name: 'Medical Records', href: '/records', icon: DocumentTextIcon, current: false },
  { name: 'Settings', href: '/settings', icon: CogIcon, current: false },
];

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-medical-primary">Robust General Hospital</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {isAuthenticated && navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-medical-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex h-16 items-center justify-center px-4">
          <h1 className="text-xl font-bold text-medical-primary">Robust General Hospital</h1>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {isAuthenticated && navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-medical-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function Header({ isOpen, setIsOpen }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-gray-500 p-2 rounded-md"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isAuthenticated ? 'Robust General Hospital Management System' : 'Welcome to Robust General Hospital'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button className="text-gray-400 hover:text-gray-500 p-2 rounded-md relative">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User menu */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-medical-primary flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Mobile user menu */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAuthenticated ? (
              <>
                <button className="text-gray-400 hover:text-gray-500 p-2 rounded-md relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-medical-primary flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="lg:pl-64">
          <Header isOpen={isOpen} setIsOpen={setIsOpen} />
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
