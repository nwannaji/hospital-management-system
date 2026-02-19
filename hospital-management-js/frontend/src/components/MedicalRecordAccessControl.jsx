import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MedicalRecordAccessControl = ({ patientRecord, children }) => {
  const { canAccessPatientRecord, hasRole } = useAuth();

  // Check if user can access this specific patient's medical record
  if (!canAccessPatientRecord(patientRecord)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">
            {hasRole('admin') 
              ? 'Administrators are not authorized to view patient medical records.'
              : hasRole('doctor')
              ? 'You can only access medical records of patients assigned to you.'
              : 'You can only access your own medical records.'
            }
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MedicalRecordAccessControl;
