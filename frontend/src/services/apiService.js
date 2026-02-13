import axios from 'axios';
import { toast } from 'react-toastify';
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
    } else {
      console.warn('No auth token available for API request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Mark error as handled to prevent duplicate toasts in components
    error.isHandled = false;
    
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      error.isHandled = true;
      
      // Sign out from Cognito before redirecting to clear the session
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Error during auto-logout:', logoutError);
      }
      
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
      error.isHandled = true;
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission.');
      error.isHandled = true;
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
      error.isHandled = true;
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