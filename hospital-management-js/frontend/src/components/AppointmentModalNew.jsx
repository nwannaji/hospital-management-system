import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function AppointmentModal({ isOpen, onClose, onSuccess, editingAppointment }) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'Checkup',
    notes: ''
  });

  React.useEffect(() => {
    if (editingAppointment) {
      setFormData(editingAppointment);
    } else {
      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'Checkup',
        notes: ''
      });
    }
  }, [editingAppointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting appointment:', formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select name="patientId" value={formData.patientId} onChange={handleInputChange} required>
              <option value="">Select Patient</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} required>
              <option value="">Select Doctor</option>
              <option value="1">Dr. Alice Johnson</option>
              <option value="2">Dr. Bob Wilson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleInputChange} required />
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentModal;
