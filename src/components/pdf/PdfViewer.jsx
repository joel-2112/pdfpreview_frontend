import React, { useEffect, useRef, useState } from 'react';
import usePdfViewer from '../../hooks/usePdfViewer';
import { ADOBE_CONFIG } from '../../constants/adobeConfig';
import PdfLoadingState from './PdfLoadingState';
import PdfFallback from './PdfFallback';
import { AlertTriangle } from 'lucide-react';

export const PdfViewer = ({ docId, viewType = 'original', fileName = 'document.pdf' }) => {
  const containerRef = useRef(null);
  const { sdkReady, error: sdkError } = usePdfViewer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  // 1. Fetch temporal signed url token on load
  useEffect(() => {
    let active = true;
    const fetchSignedLink = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/documents/${docId}/secure-link?type=${viewType}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (active) {
          if (data.success && data.data.signedUrl) {
            setFileUrl(data.data.signedUrl);
          } else {
            setError(data.message || 'Failed to generate secure PDF streaming token.');
          }
        }
      } catch (err) {
        if (active) {
          setError('Failed to contact backend API server.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    
    if (docId) fetchSignedLink();
    
    return () => {
      active = false;
    };
  }, [docId, viewType]);

  // 2. Initialize Adobe PDF Embed API once SDK and URL are ready
  useEffect(() => {
    if (!sdkReady || !fileUrl || loading || error || useFallback) return;

    let adobeDCView = null;
    const viewDivId = `adobe-pdf-view-${docId}-${viewType}`;

    const renderAdobeView = async () => {
      try {
        // Fetch document ArrayBuffer directly through same-origin endpoint to prevent CORS blocks
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error('Physical PDF content streaming failed.');
        const buffer = await res.arrayBuffer();

        if (!window.AdobeDC) {
          throw new Error('Adobe PDF View SDK missing.');
        }

        adobeDCView = new window.AdobeDC.View({
          clientId: ADOBE_CONFIG.CLIENT_ID,
          divId: viewDivId,
        });

        adobeDCView.previewFile({
          content: { promise: Promise.resolve(buffer) },
          metaData: { fileName: fileName }
        }, ADOBE_CONFIG.DEFAULT_VIEW_SETTINGS);

      } catch (err) {
        console.error('Adobe Embed API crash, routing to fallback renderer:', err);
        setUseFallback(true);
      }
    };

    renderAdobeView();

    return () => {
      // Cleanup visual handlers if any
    };
  }, [sdkReady, fileUrl, loading, error, docId, viewType, fileName, useFallback]);

  if (loading) {
    return <PdfLoadingState />;
  }

  if (error) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h4 className="mb-2 font-bold text-white text-base">Failed to stream PDF</h4>
        <p className="text-sm text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  if (useFallback || sdkError) {
    // If Adobe client crashes, route to high-fidelity react-pdf renderer
    return <PdfFallback url={fileUrl} />;
  }

  const viewDivId = `adobe-pdf-view-${docId}-${viewType}`;

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
      <div id={viewDivId} className="w-full h-full" ref={containerRef} />
    </div>
  );
};

export default PdfViewer;
