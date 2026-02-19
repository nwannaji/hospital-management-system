const API_BASE_URL = ''; // Use relative URL for Vite proxy

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setAuthHeader(token) {
    this.token = token;
  }

  removeAuthHeader() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`, config.body ? JSON.parse(config.body) : '');
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, detail: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth methods
  async login(email, password) {
    return this.post('/api/auth/login', { email, password });
  }

  async register(userData) {
    return this.post('/api/auth/register', userData);
  }

  async getCurrentUser() {
    return this.get('/api/auth/me');
  }

  // Patient methods
  async getPatients() {
    return this.get('/api/patients');
  }

  async createPatient(patientData) {
    return this.post('/api/patients', patientData);
  }

  async deletePatient(patientId) {
    return this.delete(`/api/patients/${patientId}`);
  }

  // Doctor methods
  async getDoctors() {
    return this.get('/api/doctors');
  }

  async createDoctor(doctorData) {
    return this.post('/api/doctors', doctorData);
  }

  async deleteDoctor(doctorId) {
    return this.delete(`/api/doctors/${doctorId}`);
  }

  // Appointment methods
  async getAppointments() {
    return this.get('/api/appointments');
  }

  async createAppointment(appointmentData) {
    return this.post('/api/appointments', appointmentData);
  }

  async deleteAppointment(appointmentId) {
    return this.delete(`/api/appointments/${appointmentId}`);
  }

  // Department methods
  async getDepartments() {
    return this.get('/api/departments');
  }

  async createDepartment(departmentData) {
    return this.post('/api/departments', departmentData);
  }

  async deleteDepartment(departmentId) {
    return this.delete(`/api/departments/${departmentId}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.get('/api/dashboard/stats');
  }
}

const api = new ApiClient();
export default api;
