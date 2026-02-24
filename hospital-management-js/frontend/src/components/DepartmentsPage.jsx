import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import api from '../api';
import DepartmentModalStyled from './DepartmentModalStyled';

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments();
      setDepartments(data.results || data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateDepartment = useCallback(() => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  }, []);

  const handleEditDepartment = useCallback((department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  }, []);

  const handleDeleteDepartment = useCallback(async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  }, []);

  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    fetchDepartments();
  }, [fetchDepartments]);

  const departmentCards = useMemo(() => 
    departments.map((department) => (
      <DepartmentCard 
        key={department.id} 
        department={department}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />
    )),
    [departments, handleEditDepartment, handleDeleteDepartment]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader onCreateDepartment={handleCreateDepartment} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentCards}
      </div>

      {departments.length === 0 && (
        <EmptyState onCreateDepartment={handleCreateDepartment} />
      )}

      <DepartmentModalStyled
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingDepartment={editingDepartment}
      />
    </div>
  );
}

// Optimized sub-components
const PageHeader = React.memo(({ onCreateDepartment }) => (
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
    <button
      onClick={onCreateDepartment}
      className="btn-add-department flex items-center gap-2"
    >
      <PlusIcon className="h-5 w-5" />
      Add Department
    </button>
  </div>
));

const DepartmentCard = React.memo(({ department, onEdit, onDelete }) => {
  const statusClass = department.status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800';

  return (
    <div className="medical-card">
      <div className="medical-card-header">
        <div className="flex items-center">
          <div className="shrink-0">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {department.name}
            </h3>
            <p className="text-sm text-gray-500">
              {department.description}
            </p>
          </div>
        </div>
      </div>
      <div className="medical-card-content">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
              {department.status}
            </span>
          </div>
          
          {department.headDoctor && (
            <div>
              <span className="text-sm font-medium text-gray-500">Head Doctor</span>
              <p className="text-sm text-gray-900">
                Dr. {department.headDoctor.firstName} {department.headDoctor.lastName}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{department.doctors?.length || 0}</span> doctors
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{department.staff?.length || 0}</span> staff
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(department)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(department.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

const EmptyState = React.memo(({ onCreateDepartment }) => (
  <div className="text-center py-12">
    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No departments</h3>
    <p className="mt-1 text-sm text-gray-500">
      Get started by adding your first department.
    </p>
    <div className="mt-6">
      <button
        onClick={onCreateDepartment}
        className="btn-add-department"
      >
        Add Department
      </button>
    </div>
  </div>
));

export default DepartmentsPage;
