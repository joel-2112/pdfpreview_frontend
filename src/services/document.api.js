import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const documentApi = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post(API_ROUTES.DOCUMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  getAll: () => {
    return api.get(API_ROUTES.DOCUMENTS.GET_ALL);
  },
  
  getOne: (id) => {
    return api.get(API_ROUTES.DOCUMENTS.GET_ONE(id));
  },
  
  delete: (id) => {
    return api.delete(API_ROUTES.DOCUMENTS.DELETE(id));
  },
  
  getSecureLink: (id, type = 'original') => {
    return api.get(`${API_ROUTES.DOCUMENTS.SECURE_LINK(id)}?type=${type}`);
  },

  preparePreview: (id) => {
    return api.post(API_ROUTES.DOCUMENTS.PREPARE_PREVIEW(id));
  },

  uploadPreviewPdf: (id, file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post(API_ROUTES.DOCUMENTS.PREVIEW_PDF(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPreviewCapabilities: () => {
    return api.get(API_ROUTES.DOCUMENTS.PREVIEW_CAPABILITIES);
  },

  convertToHtml: (id) => api.post(API_ROUTES.DOCUMENTS.CONVERT_TO_HTML(id)),

  getHtmlFormLink: (id) => api.get(API_ROUTES.DOCUMENTS.HTML_FORM(id)),

  reanalyze: (id) => api.post(API_ROUTES.DOCUMENTS.REANALYZE(id)),
};

export default documentApi;
