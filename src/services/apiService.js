import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/constants';
import { authService } from './authService';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const notesApi = {
  async createNote(patientId, data) {
    const response = await apiClient.post(
      API_ENDPOINTS.NOTES.CREATE(patientId),
      data
    );
    return response.data;
  },

  async listNotes(patientId, params = {}) {
    const response = await apiClient.get(
      API_ENDPOINTS.NOTES.LIST(patientId),
      { params }
    );
    return response.data;
  },

  async getNote(patientId, noteId) {
    const response = await apiClient.get(
      API_ENDPOINTS.NOTES.GET(patientId, noteId)
    );
    return response.data;
  },

  async updateNote(patientId, noteId, data) {
    const response = await apiClient.put(
      API_ENDPOINTS.NOTES.UPDATE(patientId, noteId),
      data
    );
    return response.data;
  },

  async deleteNote(patientId, noteId) {
    const response = await apiClient.delete(
      API_ENDPOINTS.NOTES.DELETE(patientId, noteId)
    );
    return response.data;
  },

  async presignUpload(filename, contentType) {
    const response = await apiClient.post(API_ENDPOINTS.ATTACHMENTS.PRESIGN, {
      filename,
      contentType,
    });
    return response.data;
  },

  async uploadFile(presignedUrl, file) {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },
};