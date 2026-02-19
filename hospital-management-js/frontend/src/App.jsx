import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const PatientsPage = lazy(() => import('./components/PatientsPage'));
const DoctorsPage = lazy(() => import('./components/DoctorsPage'));
const AppointmentsPage = lazy(() => import('./components/AppointmentsPage'));
const DepartmentsPage = lazy(() => import('./components/DepartmentsPage'));
const MedicalRecordsPage = lazy(() => import('./components/MedicalRecordsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const EmergencyPage = lazy(() => import('./components/EmergencyPage'));
const ClinicalStaffPage = lazy(() => import('./components/ClinicalStaffPage'));
const RoomManagementPage = lazy(() => import('./components/RoomManagementPage'));
const PharmacyPage = lazy(() => import('./components/PharmacyPage'));
const VitalMonitoringPage = lazy(() => import('./components/VitalMonitoringPage'));
const ReportsPage = lazy(() => import('./components/ReportsPage'));
const LaboratoryPage = lazy(() => import('./components/LaboratoryPage'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const PatientModal = lazy(() => import('./components/PatientModal'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const RegisterModal = lazy(() => import('./components/RegisterModal'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Unauthorized = lazy(() => import('./components/Unauthorized'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function AuthenticatedApp() {
  const [isPatientModalOpen, setIsPatientModalOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const handleOpenLoginModal = () => setIsLoginModalOpen(true);
    const handleOpenRegisterModal = () => setIsRegisterModalOpen(true);

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openRegisterModal', handleOpenRegisterModal);

    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openRegisterModal', handleOpenRegisterModal);
    };
  }, []);

  const handlePatientSuccess = () => {
    console.log('Patient created successfully');
  };

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setTimeout(() => setIsRegisterModalOpen(true), 100);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/patients" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PatientsPage />
            </Suspense>
          } />
          <Route path="/patients/new" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PatientsPage />
            </Suspense>
          } />
          <Route path="/doctors" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <DoctorsPage />
            </Suspense>
          } />
          <Route path="/appointments" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <AppointmentsPage />
            </Suspense>
          } />
          <Route path="/appointments/new" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <AppointmentsPage />
            </Suspense>
          } />
          <Route path="/departments" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <DepartmentsPage />
            </Suspense>
          } />
          <Route path="/medical-records" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <MedicalRecordsPage />
            </Suspense>
          } />
          <Route path="/records/new" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <MedicalRecordsPage />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <SettingsPage />
            </Suspense>
          } />
          <Route path="/emergency" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <EmergencyPage />
            </Suspense>
          } />
          <Route path="/staff" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <ClinicalStaffPage />
            </Suspense>
          } />
          <Route path="/rooms" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <RoomManagementPage />
            </Suspense>
          } />
          <Route path="/rooms/assign" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <RoomManagementPage />
            </Suspense>
          } />
          <Route path="/pharmacy" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <PharmacyPage />
            </Suspense>
          } />
          <Route path="/vital-monitoring" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <VitalMonitoringPage />
            </Suspense>
          } />
          <Route path="/reports" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <ReportsPage />
            </Suspense>
          } />
          <Route path="/laboratory" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <LaboratoryPage />
            </Suspense>
          } />
          <Route path="/notifications" element={
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <NotificationsPage />
            </Suspense>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AuthenticatedApp />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
