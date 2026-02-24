import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../api';

function MedicalRecordsPage() {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  // Simulate current logged-in patient (in real app, this would come from auth context)
  useEffect(() => {
    // For demo purposes, we'll simulate a patient login
    // In production, this would come from authentication context
    const simulatePatientLogin = async () => {
      try {
        // Get all patients to simulate login
        const patientsResponse = await api.getPatients();
        const patients = patientsResponse.results || patientsResponse;
        
        if (patients.length > 0) {
          // Simulate logging in as the first patient (John Doe)
          const patient = patients[0];
          setCurrentPatient(patient);
          console.log('Simulated patient login:', patient);
        }
      } catch (error) {
        console.error('Failed to simulate patient login:', error);
      }
    };

    simulatePatientLogin();
  }, []);

  useEffect(() => {
    if (currentPatient) {
      fetchRecords();
    }
  }, [currentPatient]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/medical-records');
      
      // Handle paginated response from Django REST Framework
      const recordsData = data.results || data;
      setAllRecords(recordsData);
      
      // Filter records to show ONLY the current patient's records
      const patientRecords = recordsData.filter(record => 
        record.patient === currentPatient.id
      );
      
      setRecords(patientRecords);
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
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        await api.delete(`/api/medical-records/${recordId}`);
        fetchRecords();
      } catch (error) {
        console.error('Failed to delete medical record:', error);
      }
    }
  };

  const filteredRecords = records.filter(record => {
    if (filterBy === 'all') return true;
    if (filterBy === 'recent') {
      const recordDate = new Date(record.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    }
    return true;
  }).filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.diagnosis?.toLowerCase().includes(searchLower) ||
      record.treatment?.toLowerCase().includes(searchLower) ||
      record.prescription?.toLowerCase().includes(searchLower) ||
      record.doctor_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Patient Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">Please log in to view your medical records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                {currentPatient.first_name?.[0]}{currentPatient.last_name?.[0]}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  My Medical Records
                </h1>
                <p className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                  {currentPatient.first_name} {currentPatient.last_name} • Patient ID: {currentPatient.id?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-5 w-5" style={{color: 'hsl(var(--medical-success))'}} />
              <span className="text-sm font-medium" style={{color: 'hsl(var(--medical-success))'}}>
                Active Patient
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-primary) / 0.1)'}}>
                <DocumentTextIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-primary))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Total Records</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{records.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-success) / 0.1)'}}>
                <UserIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-success))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Treating Doctors</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {new Set(records.map(r => r.doctor_name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-warning) / 0.1)'}}>
                <CalendarIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-warning))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Recent Visits</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {records.filter(r => {
                    const recordDate = new Date(r.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return recordDate >= thirtyDaysAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-info) / 0.1)'}}>
                <ClockIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-info))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Last Visit</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {records.length > 0 
                    ? new Date(Math.max(...records.map(r => new Date(r.created_at)))).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search your medical records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="medical-input"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterBy === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Records ({records.length})
              </button>
              <button
                onClick={() => setFilterBy('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterBy === 'recent' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Recent (30 days)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="overflow-x-auto">
            <table className="medical-table">
              <thead>
                <tr>
                  <th className="medical-table-header">Date</th>
                  <th className="medical-table-header">Doctor</th>
                  <th className="medical-table-header">Diagnosis</th>
                  <th className="medical-table-header">Treatment</th>
                  <th className="medical-table-header">Prescription</th>
                  <th className="medical-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="medical-table-row">
                    <td className="medical-table-cell">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" style={{color: 'hsl(var(--muted-foreground))'}} />
                        <div>
                          <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                            {new Date(record.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                            {new Date(record.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        Dr. {record.doctor_name}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm max-w-xs" style={{color: 'hsl(var(--foreground))'}}>
                        {record.diagnosis ? (
                          record.diagnosis.length > 50 
                            ? `${record.diagnosis.substring(0, 50)}...` 
                            : record.diagnosis
                        ) : (
                          <span style={{color: 'hsl(var(--muted-foreground))'}}>No diagnosis recorded</span>
                        )}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm max-w-xs" style={{color: 'hsl(var(--foreground))'}}>
                        {record.treatment ? (
                          record.treatment.length > 50 
                            ? `${record.treatment.substring(0, 50)}...` 
                            : record.treatment
                        ) : (
                          <span style={{color: 'hsl(var(--muted-foreground))'}}>No treatment recorded</span>
                        )}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm max-w-xs" style={{color: 'hsl(var(--foreground))'}}>
                        {record.prescription ? (
                          record.prescription.length > 50 
                            ? `${record.prescription.substring(0, 50)}...` 
                            : record.prescription
                        ) : (
                          <span style={{color: 'hsl(var(--muted-foreground))'}}>No prescription recorded</span>
                        )}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="action-button edit"
                          title="View Full Record"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="action-button delete"
                          title="Delete Record"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12" style={{color: 'hsl(var(--muted-foreground))'}} />
          <h3 className="mt-2 text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>No medical records found</h3>
          <p className="mt-1 text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
            {searchTerm || filterBy !== 'all' 
              ? 'No records match your search criteria.'
              : 'Your medical records will appear here after your appointments.'
            }
          </p>
        </div>
      )}

      {/* View Record Modal */}
      {isViewModalOpen && selectedRecord && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-2" style={{color: 'hsl(var(--medical-primary))'}} />
                <h2 className="text-xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  Medical Record Details
                </h2>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{color: 'hsl(var(--muted-foreground))'}}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Patient Info */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Patient Information
                  </h3>
                </div>
                <div className="medical-card-content">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Name</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {currentPatient.first_name} {currentPatient.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Patient ID</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {currentPatient.id?.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Blood Group</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {currentPatient.blood_group || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Date of Birth</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {currentPatient.date_of_birth ? new Date(currentPatient.date_of_birth).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Medical Information
                  </h3>
                </div>
                <div className="medical-card-content space-y-4">
                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Treating Doctor</p>
                    <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                      Dr. {selectedRecord.doctor_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Visit Date</p>
                    <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                      {new Date(selectedRecord.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Diagnosis</p>
                    <p className="text-sm whitespace-pre-wrap" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedRecord.diagnosis || 'No diagnosis recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Treatment</p>
                    <p className="text-sm whitespace-pre-wrap" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedRecord.treatment || 'No treatment recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Prescription</p>
                    <p className="text-sm whitespace-pre-wrap" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedRecord.prescription || 'No prescription recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Additional Notes</p>
                    <p className="text-sm whitespace-pre-wrap" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedRecord.notes || 'No additional notes'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalRecordsPage;
