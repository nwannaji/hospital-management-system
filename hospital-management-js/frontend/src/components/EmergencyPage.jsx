import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  UserGroupIcon, 
  HomeIcon, 
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '../api';

function EmergencyPage() {
  const [emergencyPatients, setEmergencyPatients] = useState([]);
  const [bedStats, setBedStats] = useState({
    totalBeds: 50,
    occupiedBeds: 32,
    availableBeds: 18,
    staffOnDuty: 8
  });
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmergencyData();
    // Simulate real-time updates
    const interval = setInterval(fetchEmergencyData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyData = async () => {
    try {
      // Fetch patients and simulate emergency data
      const patientsResponse = await api.getPatients();
      const patients = patientsResponse.results || patientsResponse;
      
      // Simulate emergency patients (in real app, this would be a separate API)
      const emergencyData = patients.slice(0, 4).map((patient, index) => ({
        id: patient.id,
        patientName: `${patient.first_name} ${patient.last_name}`,
        patientId: patient.id,
        age: Math.floor(Math.random() * 40) + 20,
        gender: patient.gender,
        condition: ['Cardiac Arrest', 'Trauma', 'Stroke', 'Respiratory Distress'][index],
        severity: ['Critical', 'Urgent', 'Stable'][Math.floor(Math.random() * 3)],
        arrivalTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        bedNumber: `ER-${index + 1}`,
        assignedDoctor: ['Dr. Alice Johnson', 'Dr. Bob Smith', 'Dr. Carol Davis', 'Dr. David Wilson'][index],
        vitals: {
          bloodPressure: `${120 + Math.floor(Math.random() * 40)}/${80 + Math.floor(Math.random() * 20)}`,
          heartRate: 60 + Math.floor(Math.random() * 40),
          temperature: (36 + Math.random() * 2).toFixed(1),
          oxygenSaturation: 95 + Math.floor(Math.random() * 5)
        },
        status: ['Under Treatment', 'Awaiting Doctor', 'Stable', 'Critical'][Math.floor(Math.random() * 4)]
      }));

      setEmergencyPatients(emergencyData);
      
      // Update bed stats
      setBedStats(prev => ({
        ...prev,
        occupiedBeds: emergencyData.length,
        availableBeds: prev.totalBeds - emergencyData.length
      }));
      
    } catch (error) {
      console.error('Failed to fetch emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleEmergencyAlert = () => {
    alert('Emergency alert sent to all on-duty staff!');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'medical-badge-critical';
      case 'Urgent': return 'medical-badge-urgent';
      case 'Stable': return 'medical-badge-stable';
      default: return 'medical-badge-stable';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Treatment': return 'text-blue-600';
      case 'Awaiting Doctor': return 'text-yellow-600';
      case 'Stable': return 'text-green-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredPatients = emergencyPatients.filter(patient => {
    const matchesFilter = filterBy === 'all' || patient.severity === filterBy;
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.assignedDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-danger) / 0.1)'}}>
                <HomeIcon className="h-8 w-8" style={{color: 'hsl(var(--medical-danger))'}} />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  Emergency Ward
                </h1>
                <p className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                  Real-time emergency patient monitoring
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEmergencyAlert}
                className="btn-schedule-appointment flex items-center gap-2"
                style={{backgroundColor: 'hsl(var(--medical-danger))'}}
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                Emergency Alert
              </button>
              <button className="btn-schedule-appointment flex items-center gap-2">
                <EyeIcon className="h-5 w-5" />
                View All Patients
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-primary) / 0.1)'}}>
                <BuildingOfficeIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-primary))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Total Beds</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{bedStats.totalBeds}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-warning) / 0.1)'}}>
                <UserGroupIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-warning))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Occupied</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{bedStats.occupiedBeds}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-success) / 0.1)'}}>
                <HeartIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-success))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Available</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{bedStats.availableBeds}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-secondary) / 0.1)'}}>
                <UserGroupIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-secondary))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Staff on Duty</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{bedStats.staffOnDuty}</p>
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
                placeholder="Search emergency patients..."
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
                All ({emergencyPatients.length})
              </button>
              <button
                onClick={() => setFilterBy('Critical')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterBy === 'Critical' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Critical ({emergencyPatients.filter(p => p.severity === 'Critical').length})
              </button>
              <button
                onClick={() => setFilterBy('Urgent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterBy === 'Urgent' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Urgent ({emergencyPatients.filter(p => p.severity === 'Urgent').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Patients Table */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="overflow-x-auto">
            <table className="medical-table">
              <thead>
                <tr>
                  <th className="medical-table-header">Patient</th>
                  <th className="medical-table-header">Condition</th>
                  <th className="medical-table-header">Severity</th>
                  <th className="medical-table-header">Vitals</th>
                  <th className="medical-table-header">Bed</th>
                  <th className="medical-table-header">Doctor</th>
                  <th className="medical-table-header">Status</th>
                  <th className="medical-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="medical-table-row">
                    <td className="medical-table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                          {patient.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                            {patient.patientName}
                          </div>
                          <div className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                            {patient.age} years • {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {patient.condition}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <span className={`medical-badge ${getSeverityColor(patient.severity)}`}>
                        {patient.severity}
                      </span>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center" style={{color: 'hsl(var(--foreground))'}}>
                          <HeartIcon className="h-3 w-3 mr-1" style={{color: 'hsl(var(--medical-danger))'}} />
                          {patient.vitals.heartRate} bpm
                        </div>
                        <div className="flex items-center" style={{color: 'hsl(var(--foreground))'}}>
                          BP: {patient.vitals.bloodPressure}
                        </div>
                        <div className="flex items-center" style={{color: 'hsl(var(--foreground))'}}>
                          SpO2: {patient.vitals.oxygenSaturation}%
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {patient.bedNumber}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {patient.assignedDoctor}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm font-medium" style={{color: getStatusColor(patient.status)}}>
                        {patient.status}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="action-button edit"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
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

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <HomeIcon className="mx-auto h-12 w-12" style={{color: 'hsl(var(--muted-foreground))'}} />
          <h3 className="mt-2 text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
            No emergency patients
          </h3>
          <p className="mt-1 text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
            {searchTerm || filterBy !== 'all' 
              ? 'No patients match your search criteria.'
              : 'No emergency patients currently in the ward.'
            }
          </p>
        </div>
      )}

      {/* Patient Details Modal */}
      {isModalOpen && selectedPatient && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <HeartIcon className="h-6 w-6 mr-2" style={{color: 'hsl(var(--medical-danger))'}} />
                <h2 className="text-xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  Emergency Patient Details
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
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
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedPatient.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Age/Gender</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedPatient.age} years • {selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Bed Number</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedPatient.bedNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Arrival Time</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {new Date(selectedPatient.arrivalTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Medical Information
                  </h3>
                </div>
                <div className="medical-card-content space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Condition</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedPatient.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Severity</p>
                      <span className={`medical-badge ${getSeverityColor(selectedPatient.severity)}`}>
                        {selectedPatient.severity}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Status</p>
                      <p className="text-sm font-medium" style={{color: getStatusColor(selectedPatient.status)}}>
                        {selectedPatient.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Assigned Doctor</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedPatient.assignedDoctor}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Vital Signs</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-2" style={{color: 'hsl(var(--medical-danger))'}} />
                        <span className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          Heart Rate: {selectedPatient.vitals.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          Blood Pressure: {selectedPatient.vitals.bloodPressure}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          Temperature: {selectedPatient.vitals.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          SpO2: {selectedPatient.vitals.oxygenSaturation}%
                        </span>
                      </div>
                    </div>
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

export default EmergencyPage;
