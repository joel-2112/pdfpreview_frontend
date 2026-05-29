import { useState, useCallback } from 'react';
import documentApi from '../services/document.api';
import parseError from '../utils/errorHandler';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentApi.getAll();
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (file) => {
    setLoading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const res = await documentApi.upload(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      if (res.data.success) {
        setDocuments(prev => [res.data.data, ...prev]);
        return res.data.data;
      }
    } catch (err) {
      setError(parseError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentApi.delete(id);
      if (res.data.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(parseError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    uploadProgress,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
};

export default useDocuments;
