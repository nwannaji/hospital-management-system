import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import api from '../api';

function PatientCard({ patient, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-stable text-white';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="medical-card hover:shadow-md transition-shadow">
      <div className="medical-card-content">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-foreground">
                {patient.firstName} {patient.lastName}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                {patient.status}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">DOB:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Gender:</span> {patient.gender}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Phone:</span> {patient.phone}
              </p>
              {patient.email && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span> {patient.email}
                </p>
              )}
              {patient.address && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Address:</span> {patient.address}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              className="p-2 text-gray-400 hover:text-medical-primary transition-colors"
              title="View Details"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEdit(patient)}
              className="p-2 text-gray-400 hover:text-medical-secondary transition-colors"
              title="Edit Patient"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(patient)}
              className="p-2 text-gray-400 hover:text-medical-danger transition-colors"
              title="Delete Patient"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      const filtered = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      try {
        await api.deletePatient(patient.id);
        setPatients(prev => prev.filter(p => p.id !== patient.id));
      } catch (err) {
        setError(err.message || 'Failed to delete patient');
      }
    }
  };

  const handleEdit = (patient) => {
    // TODO: Implement edit functionality
    console.log('Edit patient:', patient);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchPatients}
          className="mt-4 px-4 py-2 bg-medical-primary text-white rounded-md hover:bg-medical-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-2">
            Manage patient records and information
          </p>
        </div>
        <Link
          to="/patients/new"
          className="btn-medical px-4 py-2 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Patient</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredPatients.length} of {patients.length} patients
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
          </p>
          {!searchTerm && (
            <Link
              to="/patients/new"
              className="mt-4 inline-flex btn-medical px-4 py-2"
            >
              Add First Patient
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
