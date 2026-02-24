import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import api from '../api';
import AppointmentModalStyled from './AppointmentModalStyled';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.getAppointments();
      console.log('DEBUG: Appointments data received:', data);
      // Handle paginated response from Django REST Framework
      setAppointments(data.results || data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.deleteAppointment(appointmentId);
        fetchAppointments();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchAppointments();
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
        <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>Appointments</h1>
        <button
          onClick={handleCreateAppointment}
          className="btn-schedule-appointment flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Schedule Appointment
        </button>
      </div>

      <div className="medical-card">
        <div className="medical-card-content">
          <div className="overflow-x-auto">
            <table className="medical-table">
              <thead>
                <tr>
                  <th className="medical-table-header">
                    Date & Time
                  </th>
                  <th className="medical-table-header">
                    Patient
                  </th>
                  <th className="medical-table-header">
                    Doctor
                  </th>
                  <th className="medical-table-header">
                    Type
                  </th>
                  <th className="medical-table-header">
                    Status
                  </th>
                  <th className="medical-table-header">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  console.log('DEBUG: Processing appointment:', appointment);
                  return (
                  <tr key={appointment.id} className="medical-table-row">
                    <td className="medical-table-cell">
                      <div className="medical-card">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2" style={{color: 'hsl(var(--muted-foreground))'}} />
                          <div>
                            <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="medical-card">
                        <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                          {appointment.patient?.first_name || appointment.patient?.firstName || 'N/A'} {appointment.patient?.last_name || appointment.patient?.lastName || ''}
                        </div>
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <div className="text-sm font-medium" style={{color: 'hsl(var(--foreground))'}}>
                        Dr. {appointment.doctor?.first_name || appointment.doctor?.firstName || 'N/A'} {appointment.doctor?.last_name || appointment.doctor?.lastName || ''}
                      </div>
                      <div className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                        {appointment.doctor?.specialization || 'N/A'}
                      </div>
                    </td>
                    <td className="medical-table-cell">
                      <span className={`medical-badge ${
                        appointment.status === 'scheduled' 
                          ? 'medical-badge-stable'
                          : appointment.status === 'completed'
                          ? 'medical-badge-recovery'
                          : 'medical-badge-critical'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="medical-table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="action-button edit"
                          title="Edit Appointment"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="action-button delete"
                          title="Delete Appointment"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AppointmentModalStyled
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingAppointment={editingAppointment}
      />
    </div>
  );
}

export default AppointmentsPage;
