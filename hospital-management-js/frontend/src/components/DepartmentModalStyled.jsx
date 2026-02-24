import React, { useState, useCallback, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function DepartmentModal({ isOpen, onClose, onSuccess, editingDepartment }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDepartment) {
      setFormData(editingDepartment);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [editingDepartment]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting department:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess?.();
      onClose();
      if (!editingDepartment) {
        setFormData({ name: '', description: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  }, [formData, editingDepartment, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        <ModalContent 
          formData={formData}
          loading={loading}
          error={error}
          editingDepartment={editingDepartment}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

// Optimized Modal Content Component
const ModalContent = React.memo(({ 
  formData, 
  loading, 
  error, 
  editingDepartment, 
  onChange, 
  onSubmit, 
  onClose 
}) => (
  <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">
        {editingDepartment ? 'Edit Department' : 'Add Department'}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500 transition-colors"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>

    {/* Form */}
    <form onSubmit={onSubmit} className="p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Department Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Department Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  </div>
));

export default DepartmentModal;
