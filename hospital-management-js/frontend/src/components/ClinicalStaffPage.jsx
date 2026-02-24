import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import api from '../api';

function ClinicalStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.getDoctors();
      setStaff(data.results || data);
    } catch (error) {
      console.error('Failed to fetch clinical staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to remove this clinical staff member?')) {
      try {
        await api.deleteDoctor(staffId);
        fetchStaff();
      } catch (error) {
        console.error('Failed to delete staff:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchStaff();
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && staffMember.status === 'ACTIVE') ||
      (filter === 'inactive' && staffMember.status !== 'ACTIVE');
    
    const matchesSearch = staffMember.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
            Clinical Staff Management
          </h1>
          <p className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
            Manage hospital clinical staff, schedules, and permissions
          </p>
        </div>
        <button
          onClick={handleCreateStaff}
          className="btn-schedule-appointment flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Staff Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-primary) / 0.1)'}}>
                <UserIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-primary))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Total Staff</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>{staff.length}</p>
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
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Departments</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {new Set(staff.map(s => s.department_name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-warning) / 0.1)'}}>
                <AcademicCapIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-warning))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Specializations</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {new Set(staff.map(s => s.specialization)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="medical-card">
          <div className="medical-card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'hsl(var(--medical-info) / 0.1)'}}>
                <CalendarIcon className="h-6 w-6" style={{color: 'hsl(var(--medical-info))'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Avg Experience</p>
                <p className="text-2xl font-semibold" style={{color: 'hsl(var(--foreground))'}}>
                  {staff.length > 0 ? Math.round(staff.reduce((sum, s) => sum + (s.experience_years || 0), 0) / staff.length) : 0} yrs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search clinical staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="medical-input"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({staff.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active ({staff.filter(s => s.status === 'ACTIVE').length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'inactive' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inactive ({staff.filter(s => s.status !== 'ACTIVE').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="medical-card">
        <div className="medical-card-content">
          <div className="overflow-x-auto">
            <table className="medical-table">
              <thead>
                <tr>
                  <th className="medical-table-header">Staff Member</th>
                  <th className="medical-table-header">Contact</th>
                  <th className="medical-table-header">Department</th>
                  <th className="medical-table-header">Specialization</th>
                  <th className="medical-table-header">Experience</th>
                  <th className="medical-table-header">Status</th>
                  <th className="medical-table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="medical-table-row">
                    <td className="medical-table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {staffMember.user?.first_name?.[0] || 'D'}
                          {staffMember.user?.last_name?.[0] || ''}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                            Dr. {staffMember.user?.first_name} {staffMember.user?.last_name}
                          </div>
                          <div className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                            License: {staffMember.license_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          <EnvelopeIcon className="h-4 w-4 mr-2" style={{color: 'hsl(var(--muted-foreground))'}} />
                          {staffMember.user?.email}
                        </div>
                        <div className="flex items-center text-sm" style={{color: 'hsl(var(--foreground))'}}>
                          <PhoneIcon className="h-4 w-4 mr-2" style={{color: 'hsl(var(--muted-foreground))'}} />
                          {staffMember.user?.phone || 'Not provided'}
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {staffMember.department_name}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {staffMember.specialization}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm" style={{color: 'hsl(var(--foreground))'}}>
                        {staffMember.experience_years} years
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <span className={`medical-badge ${
                        staffMember.status === 'ACTIVE' 
                          ? 'medical-badge-stable'
                          : 'medical-badge-critical'
                      }`}>
                        {staffMember.status}
                      </span>
                    </td>
                    <td className="medical-table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="action-button edit"
                          title="Edit Staff Member"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          className="action-button delete"
                          title="Remove Staff Member"
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
    </div>
  );
}

export default ClinicalStaffPage;
