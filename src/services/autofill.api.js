import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const autofillApi = {
  getMappings: (docId) => {
    return api.get(API_ROUTES.AUTOFILL.GET_MAPPINGS(docId));
  },
  
  updateMappings: (docId, mappings) => {
    return api.put(API_ROUTES.AUTOFILL.UPDATE_MAPPINGS(docId), { mappings });
  }
};

export default autofillApi;
