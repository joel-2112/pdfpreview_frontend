export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me'
  },
  DOCUMENTS: {
    UPLOAD: '/api/documents/upload',
    GET_ALL: '/api/documents',
    GET_ONE: (id) => `/api/documents/${id}`,
    DELETE: (id) => `/api/documents/${id}`,
    SECURE_LINK: (id) => `/api/documents/${id}/secure-link`,
    PREPARE_PREVIEW: (id) => `/api/documents/${id}/prepare-preview`,
    PREVIEW_CAPABILITIES: '/api/documents/preview-capabilities',
  },
  AUTOFILL: {
    GET_MAPPINGS: (docId) => `/api/autofill/mappings/${docId}`,
    UPDATE_MAPPINGS: (docId) => `/api/autofill/mappings/${docId}`,
  }
};
