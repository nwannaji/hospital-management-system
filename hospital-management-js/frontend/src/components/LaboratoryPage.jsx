import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon, 
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../api';

function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState([]);
  const [pendingTests, setPendingTests] = useState([]);
  const [labStats, setLabStats] = useState({
    totalTestsToday: 15,
    completedTests: 12,
    pendingTests: 3,
    criticalResults: 2,
    averageTurnaroundTime: '2.5 hours'
  });
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLabData();
    // Simulate real-time updates
    const interval = setInterval(fetchLabData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLabData = async () => {
    try {
      // Fetch patients and simulate lab test data
      const patientsResponse = await api.getPatients();
      const patients = patientsResponse.results || patientsResponse;
      
      // Simulate test results (in real app, this would be a separate API)
      const simulatedResults = [
        {
          id: 1,
          patientId: patients[0]?.id,
          patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'John Doe',
          testType: 'Blood Test',
          testDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'Completed',
          results: {
            hemoglobin: '14.2 g/dL',
            wbc: '7.5 × 10^9/L',
            rbc: '4.8 × 10^12/L',
            platelets: '250 × 10^9/L'
          },
          doctor: 'Dr. Alice Johnson',
          technician: 'Lab Tech 1',
          notes: 'Routine blood work for annual checkup'
        },
        {
          id: 2,
          patientId: patients[1]?.id,
          patientName: patients[1] ? `${patients[1].first_name} ${patients[1].last_name}` : 'Jane Smith',
          testType: 'Urinalysis',
          testDate: new Date(Date.now() - 43200000).toISOString(),
          status: 'In Progress',
          results: {
            color: 'Yellow',
            clarity: 'Clear',
            ph: '6.5',
            protein: 'Trace',
            glucose: 'Negative'
          },
          doctor: 'Dr. Bob Smith',
          technician: 'Lab Tech 2',
          notes: 'Patient reports increased thirst'
        },
        {
          id: 3,
          patientId: patients[2]?.id,
          patientName: patients[2] ? `${patients[2].first_name} ${patients[2].last_name}` : 'Michael Johnson',
          testType: 'X-Ray',
          testDate: new Date(Date.now() - 172800000).toISOString(),
          status: 'Completed',
          results: {
            findings: 'No acute abnormalities',
            impression: 'Normal chest X-ray',
            radiologist: 'Dr. Carol Davis'
          },
          doctor: 'Dr. Carol Davis',
          technician: 'Radiology Tech 1',
          notes: 'Chest X-ray for respiratory symptoms'
        }
      ];

      const simulatedPending = [
        {
          id: 4,
          patientId: patients[3]?.id,
          patientName: patients[3] ? `${patients[3].first_name} ${patients[3].last_name}` : 'Emily Brown',
          testType: 'MRI Scan',
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          priority: 'High',
          notes: 'Contrast agent required',
          status: 'Scheduled'
        },
        {
          id: 5,
          patientId: patients[0]?.id,
          patientName: patients[0] ? `${patients[0].first_name} ${patients[0].last_name}` : 'John Doe',
          testType: 'CT Scan',
          scheduledTime: new Date(Date.now() + 7200000).toISOString(),
          priority: 'Medium',
          notes: 'Patient allergic to iodine',
          status: 'Scheduled'
        }
      ];

      setTestResults(simulatedResults);
      setPendingTests(simulatedPending);
      
      // Update stats
      setLabStats({
        totalTestsToday: simulatedResults.length + simulatedPending.length,
        completedTests: simulatedResults.filter(r => r.status === 'Completed').length,
        pendingTests: simulatedPending.length,
        criticalResults: simulatedResults.filter(r => r.status === 'Completed' && 
          (r.testType === 'Blood Test' || r.testType === 'X-Ray')).length,
        averageTurnaroundTime: '2.5 hours'
      });
      
    } catch (error) {
      console.error('Failed to fetch lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTest = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleNewTestRequest = () => {
    alert('New test request form would open here');
    // TODO: Implement new test request modal
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'medical-badge-stable';
      case 'In Progress': return 'medical-badge-urgent';
      case 'Scheduled': return 'medical-badge-recovery';
      default: return 'medical-badge-stable';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'medical-badge-critical';
      case 'Medium': return 'medical-badge-urgent';
      case 'Low': return 'medical-badge-stable';
      default: return 'medical-badge-stable';
    }
  };

  const filteredResults = testResults.filter(test => {
    const matchesFilter = filterBy === 'all' || test.status === filterBy;
    const matchesSearch = test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPending = pendingTests.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
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
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-secondary) / 0.1)'}}>
                <BeakerIcon className="h-8 w-8" style={{color: 'hsl(var(--medical-secondary))'}} />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  Laboratory
                </h1>
                <p className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                  Medical test, Diagnosis and Analysis
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewTestRequest}
                className="btn-schedule-appointment flex items-center gap-2"
                style={{backgroundColor: 'hsl(var(--medical-secondary))'}}
              >
                <PlusIcon className="h-5 w-5" />
                New Test Request
              </button>
              <button className="btn-schedule-appointment flex items-center gap-2">
                <EyeIcon className="h-5 w-5" />
                View All Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-primary) / 0.1)'}}>
                <BeakerIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-primary))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Total Tests Today</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{labStats.totalTestsToday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-success) / 0.1)'}}>
                <BuildingOfficeIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-success))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Completed</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{labStats.completedTests}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-warning) / 0.1)'}}>
                <ClockIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-warning))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Pending</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{labStats.pendingTests}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-danger) / 0.1)'}}>
                <ExclamationTriangleIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-danger))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Critical Results</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{labStats.criticalResults}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Test Results */}
          <div className="medical-card">
            <div className="medical-card-header">
              <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                Recent Test Results
              </h3>
            </div>
            <div className="medical-card-content">
              <div className="space-y-4">
                {testResults.slice(0, 3).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg" style={{borderColor: 'hsl(var(--border))'}}>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {test.testType[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                          {test.testType}
                        </div>
                        <div className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {test.patientName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`medical-badge ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Tests */}
          <div className="medical-card">
            <div className="medical-card-header">
              <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                Upcoming Tests
              </h3>
            </div>
            <div className="medical-card-content">
              <div className="space-y-4">
                {pendingTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg" style={{borderColor: 'hsl(var(--border))'}}>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                        {test.testType[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                          {test.testType}
                        </div>
                        <div className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {test.patientName}
                        </div>
                        <div className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {new Date(test.scheduledTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`medical-badge ${getPriorityColor(test.priority)}`}>
                        {test.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Details Modal */}
      {isModalOpen && selectedTest && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <BeakerIcon className="h-6 w-6 mr-2" style={{color: 'hsl(var(--medical-secondary))'}} />
                <h2 className="text-xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                  Test Result Details
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
              {/* Test Info */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Test Information
                  </h3>
                </div>
                <div className="medical-card-content">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Test Type</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedTest.testType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Status</p>
                      <span className={`medical-badge ${getStatusColor(selectedTest.status)}`}>
                        {selectedTest.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Test Date</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {new Date(selectedTest.testDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Ordered By</p>
                      <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>{selectedTest.doctor}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Test Results
                  </h3>
                </div>
                <div className="medical-card-content">
                  <div className="space-y-3">
                    {Object.entries(selectedTest.results || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="medical-card">
                <div className="medical-card-header">
                  <h3 className="text-lg font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                    Additional Information
                  </h3>
                </div>
                <div className="medical-card-content space-y-4">
                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Technician</p>
                    <p className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedTest.technician || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Notes</p>
                    <p className="text-sm whitespace-pre-wrap" style={{color: 'hsl(var(--foreground))'}}>
                      {selectedTest.notes || 'No additional notes'}
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

export default LaboratoryPage;
