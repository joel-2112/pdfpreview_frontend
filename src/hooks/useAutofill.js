import { useState, useCallback } from 'react';
import autofillApi from '../services/autofill.api';
import parseError from '../utils/errorHandler';

export const useAutofill = () => {
  const [mappings, setMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMappings = useCallback(async (docId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await autofillApi.getMappings(docId);
      if (res.data.success) {
        setMappings(res.data.data.mappings || {});
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMappings = async (docId, newMappings) => {
    setLoading(true);
    setError(null);
    try {
      const res = await autofillApi.updateMappings(docId, newMappings);
      if (res.data.success) {
        setMappings(res.data.data.mappings || {});
        return true;
      }
      return false;
    } catch (err) {
      setError(parseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mappings,
    loading,
    error,
    fetchMappings,
    saveMappings
  };
};

export default useAutofill;
