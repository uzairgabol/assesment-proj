export const API_ENDPOINTS = {
  NOTES: {
    CREATE: (patientId) => `/patients/${patientId}/notes`,
    LIST: (patientId) => `/patients/${patientId}/notes`,
    GET: (patientId, noteId) => `/patients/${patientId}/notes/${noteId}`,
    UPDATE: (patientId, noteId) => `/patients/${patientId}/notes/${noteId}`,
    DELETE: (patientId, noteId) => `/patients/${patientId}/notes/${noteId}`,
  },
  ATTACHMENTS: {
    PRESIGN: '/attachments/presign',
  },
};

export const AUTH_CONFIG = {
  REGION: process.env.REACT_APP_COGNITO_REGION,
  USER_POOL_ID: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  APP_CLIENT_ID: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const APP_NAME = 'SnoreMD';

export const NOTE_TAGS = [
  'Radiology',
  'CT Scan',
  'MRI',
  'X-Ray',
  'Ultrasound',
  'Follow-up',
  'Urgent',
  'Normal',
  'Abnormal',
];

export const ROUTES = {
  LOGIN: '/login',
  CHANGE_PASSWORD: '/change-password',
  DASHBOARD: '/dashboard',
  PATIENT_NOTES: '/patients/:patientId/notes',
};