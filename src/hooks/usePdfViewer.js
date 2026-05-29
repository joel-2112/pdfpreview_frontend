import { useState, useEffect } from 'react';
import { loadAdobeSDK } from '../utils/adobeLoader';

export const usePdfViewer = () => {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    
    loadAdobeSDK()
      .then(() => {
        if (active) {
          setSdkReady(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    sdkReady,
    loading,
    error
  };
};

export default usePdfViewer;
