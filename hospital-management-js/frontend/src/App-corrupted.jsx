import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const PatientsPage = lazy(() => import('./components/PatientsPage'));
const DoctorsPage = lazy(() => import('./components/DoctorsPage'));
const AppointmentsPage = lazy(() => import('./components/AppointmentsPage'));
const DepartmentsPage = lazy(() => import('./components/DepartmentsPage'));
const MedicalRecordsPage = lazy(() => import('./components/MedicalRecordsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
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

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setTimeout(() => setIsLoginModalOpen(true), 100);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleRegisterModalClose = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
            <ProtectedRoute>
              <Dashboard 
                onAddPatient={() => setIsPatientModalOpen(true)}
              />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/doctor-dashboard" element={
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
          } 
        />
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <Dashboard 
                onAddPatient={() => setIsPatientModalOpen(true)}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patient-dashboard" 
          element={
            <ProtectedRoute requiredRole="patient">
              <Dashboard 
                onAddPatient={() => setIsPatientModalOpen(true)}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard 
                onAddPatient={() => setIsPatientModalOpen(true)}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reception-dashboard" 
          element={
            <ProtectedRoute requiredRole="receptionist">
              <Dashboard 
                onAddPatient={() => setIsPatientModalOpen(true)}
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <ProtectedRoute requiredResource="patients">
              <PatientsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <ProtectedRoute requiredResource="appointments">
              <AppointmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <ProtectedRoute requiredResource="doctors">
              <DoctorsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/departments" 
          element={
            <ProtectedRoute requiredResource="departments">
              <DepartmentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/records" 
          element={
            <ProtectedRoute requiredRole={['doctor', 'patient']}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredResource="settings">
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={handlePatientSuccess}
      />

      {!user && (
        <>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={handleLoginModalClose}
            onSwitchToRegister={switchToRegister}
          />
          
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={handleRegisterModalClose}
            onSwitchToLogin={switchToLogin}
          />
        </>
      )}
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
