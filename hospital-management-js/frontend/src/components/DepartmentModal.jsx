import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function DepartmentModal({ isOpen, onClose, onSuccess, editingDepartment }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  React.useEffect(() => {
    if (editingDepartment) {
      setFormData(editingDepartment);
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [editingDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting department:', formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to save department:', error);
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
            {editingDepartment ? 'Edit Department' : 'Add Department'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{editingDepartment ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentModal;
