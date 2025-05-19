import axios from 'axios';

// Create Axios instance with base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptors to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Health and patient management service
export const healthRecordService = {
  // Health records
  getAllRecords: async () => {
    const res = await api.get('/health-records');
    return res.data;
  },

  getRecordById: async (id) => {
    const res = await api.get(`/health-records/${id}`);
    return res.data;
  },

  createRecord: async (formData) => {
    const res = await api.post('/health-records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  updateRecord: async (id, formData) => {
    const res = await api.put(`/health-records/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteRecord: async (id) => {
    const res = await api.delete(`/health-records/${id}`);
    return res.data;
  },

  downloadMedicalReport: async (id) => {
    const res = await api.get(`/health-records/${id}/report`, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');

    const contentDisposition = res.headers['content-disposition'];
    let filename = 'medical-report.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match && match[1]) filename = match[1];
    }

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  },

  searchRecords: async (term) => {
    const res = await api.get(`/health-records/search?q=${encodeURIComponent(term)}`);
    return res.data;
  },

  // Patient Management (for Nutritionist Dashboard)
  getAllPatients: async () => {
    const res = await api.get('/patients');
    return res.data;
  },

  getPatientById: async (id) => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  updateNutritionistNotes: async (id, notesData) => {
    const res = await api.put(`/patients/${id}/notes`, notesData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  }
};

export default api;
