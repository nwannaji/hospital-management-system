import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function DoctorModal({ isOpen, onClose, onSuccess, editingDoctor }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    phone: '',
    email: '',
    licenseNumber: '',
    departmentId: ''
  });

  React.useEffect(() => {
    if (editingDoctor) {
      setFormData(editingDoctor);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        specialization: '',
        phone: '',
        email: '',
        licenseNumber: '',
        departmentId: ''
      });
    }
  }, [editingDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting doctor:', formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to save doctor:', error);
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
            {editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specialization</label>
            <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} required>
              <option value="">Select Department</option>
              <option value="1">Cardiology</option>
              <option value="2">Neurology</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingDoctor ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorModal;
