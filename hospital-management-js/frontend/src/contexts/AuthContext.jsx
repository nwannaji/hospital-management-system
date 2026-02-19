import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !initialized) {
      setInitialized(true);
      api.setAuthHeader(token);
      fetchCurrentUser();
    } else {
      setInitialized(true);
      setLoading(false);
    }
  }, [initialized]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.user);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      api.removeAuthHeader();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username, password: '***' });
      const response = await api.post('/api/auth/login', { email: username, password });
      console.log('Login response:', response);
      const { access_token, user } = response;
      
      localStorage.setItem('token', access_token);
      api.setAuthHeader(access_token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', userData);
      const response = await api.post('/api/auth/register', userData);
      console.log('Registration response:', response);
      const { access_token, user } = response;
      
      localStorage.setItem('token', access_token);
      api.setAuthHeader(access_token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.removeAuthHeader();
    setUser(null);
  };

  // Role-based access control helpers
  const hasRole = (role) => {
    return user?.role?.toLowerCase() === role.toLowerCase();
  };

  const hasAnyRole = (roles) => {
    if (!user?.role) return false;
    return roles.some(role => user.role.toLowerCase() === role.toLowerCase());
  };

  const canAccess = (resource, patientId = null, doctorId = null) => {
    const userRole = user?.role?.toLowerCase();
    const userId = user?.id;
    
    // Define basic access control matrix
    const accessMatrix = {
      'admin': ['patients', 'doctors', 'appointments', 'departments', 'settings'], // Note: medical_records removed
      'doctor': ['patients', 'appointments', 'medical_records', 'doctors', 'departments'], // Full access for doctors
      'receptionist': ['patients', 'appointments'],
      'patient': ['appointments']
    };

    // Check basic resource access
    if (!accessMatrix[userRole]?.includes(resource)) {
      return false;
    }

    // Medical records access control
    if (resource === 'medical_records') {
      if (userRole === 'doctor') {
        // Doctors can only access medical records of their own patients
        if (patientId && doctorId) {
          return doctorId === userId; // Only if this doctor is assigned to this patient
        }
        // For general medical records access, we'll need to check at the component level
        return true;
      } else if (userRole === 'patient') {
        // Patients can only access their own medical records
        return patientId === userId;
      } else if (userRole === 'admin') {
        // Admins are denied access to medical records
        return false;
      }
    }

    return true;
  };

  const canAccessPatientRecord = (patientRecord) => {
    const userRole = user?.role?.toLowerCase();
    const userId = user?.id;
    
    if (userRole === 'doctor') {
      // Check if this doctor is the assigned doctor for this patient
      return patientRecord.assignedDoctorId === userId;
    } else if (userRole === 'patient') {
      // Check if this is the patient's own record
      return patientRecord.patientId === userId;
    } else if (userRole === 'admin') {
      // Admins are denied access to patient medical records
      return false;
    }
    return false;
  };

  const getDashboardRoute = () => {
    const userRole = user?.role?.toLowerCase();
    switch (userRole) {
      case 'doctor':
        return '/doctor-dashboard';
      case 'patient':
        return '/patient-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'receptionist':
        return '/reception-dashboard';
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    canAccess,
    canAccessPatientRecord,
    getDashboardRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
