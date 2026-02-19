import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import MedicalRecordAccessControl from './MedicalRecordAccessControl';

function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await api.get('/api/medical-records');
      
      // Filter records based on user role and permissions
      let filteredRecords = data;
      if (hasRole('doctor')) {
        // Doctors can only see records of their assigned patients
        filteredRecords = data.filter(record => record.assignedDoctorId === user.id);
      } else if (hasRole('patient')) {
        // Patients can only see their own records
        filteredRecords = data.filter(record => record.patientId === user.id);
      }
      // Admins are completely blocked from medical records
      
      setRecords(filteredRecords);
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await api.delete(`/api/medical-records/${recordId}`);
        fetchRecords();
      } catch (error) {
        console.error('Failed to delete medical record:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
      </div>

      <div className="medical-card">
        <div className="medical-card-content">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <MedicalRecordAccessControl 
                    key={record.id} 
                    patientRecord={{
                      patientId: record.patientId,
                      assignedDoctorId: record.assignedDoctorId || record.doctorId
                    }}
                  >
                    <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.patient?.firstName} {record.patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.patientId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.doctor?.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.diagnosis ? (
                          record.diagnosis.length > 50 
                            ? `${record.diagnosis.substring(0, 50)}...` 
                            : record.diagnosis
                        ) : (
                          <span className="text-gray-400">No diagnosis recorded</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                    </tr>
                  </MedicalRecordAccessControl>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {records.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Medical records will appear here when patients are treated.
          </p>
        </div>
      )}

      {/* View Record Modal */}
      {isViewModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Medical Record Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                  <p className="text-sm text-gray-900">
                    {selectedRecord.patient?.firstName} {selectedRecord.patient?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                  <p className="text-sm text-gray-900">
                    Dr. {selectedRecord.doctor?.firstName} {selectedRecord.doctor?.lastName}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                <p className="text-sm text-gray-900">
                  {selectedRecord.diagnosis || 'No diagnosis recorded'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Treatment</h3>
                <p className="text-sm text-gray-900">
                  {selectedRecord.treatment || 'No treatment recorded'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Prescription</h3>
                <p className="text-sm text-gray-900">
                  {selectedRecord.prescription || 'No prescription recorded'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="text-sm text-gray-900">
                  {selectedRecord.notes || 'No notes recorded'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalRecordsPage;
