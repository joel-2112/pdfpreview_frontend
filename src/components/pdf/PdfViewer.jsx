import React, { useEffect, useRef, useState, useCallback } from 'react';
import usePdfViewer from '../../hooks/usePdfViewer';
import api from '../../services/api';
import documentApi from '../../services/document.api';
import { ADOBE_CONFIG, getAdobeViewSettings } from '../../constants/adobeConfig';
import { PDF_TYPES } from '../../constants/pdfTypes';
import {
  needsServerPreview,
  getSecureLinkType,
  getEffectivePdfTypeForViewer,
  isLiveCycleXfa,
  isXfaPlaceholderBuffer,
  hasManualPreview,
  shouldUseHtmlFormViewer,
} from '../../utils/pdfPreviewStrategy';
import PdfLoadingState from './PdfLoadingState';
import PdfFallback from './PdfFallback';
import PdfXfaNotice from './PdfXfaNotice';
import PdfHtmlFormViewer from './PdfHtmlFormViewer';
import { AlertTriangle } from 'lucide-react';

export const PdfViewer = ({
  docId,
  viewType = 'original',
  fileName = 'document.pdf',
  pdfType: pdfTypeProp,
  hasXfa: hasXfaProp,
}) => {
  const containerRef = useRef(null);
  const { sdkReady, error: sdkError } = usePdfViewer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [docMeta, setDocMeta] = useState(null);
  const [xfaPreviewBlocked, setXfaPreviewBlocked] = useState(false);
  const [usingFlattenedPreview, setUsingFlattenedPreview] = useState(false);
  const [preparingPreview, setPreparingPreview] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [linkRefreshKey, setLinkRefreshKey] = useState(0);

  // Always load metadata from API so XFA / field counts are accurate for routing
  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const res = await documentApi.getOne(docId);
        if (active && res.data?.success) {
          const doc = res.data.data;
          setDocMeta({
            ...doc,
            type: pdfTypeProp ?? doc.type,
            hasXfa: hasXfaProp ?? doc.hasXfa,
          });
        }
      } catch {
        if (active) {
          setDocMeta({
            type: pdfTypeProp || PDF_TYPES.ACROFORM,
            hasXfa: Boolean(hasXfaProp),
            fields: [],
          });
        }
      }
    };
    if (docId) loadMeta();
    return () => {
      active = false;
    };
  }, [docId, pdfTypeProp, hasXfaProp]);

  const effectiveDoc = docMeta || {
    type: pdfTypeProp || PDF_TYPES.ACROFORM,
    hasXfa: hasXfaProp || false,
    fields: [],
  };

  const requiresXfaConversion =
    viewType !== 'filled' && needsServerPreview(effectiveDoc);
  const embedPdfType = getEffectivePdfTypeForViewer(effectiveDoc, usingFlattenedPreview);

  // Fetch signed URL (uses type=preview for XFA so backend serves flattened PDF when available)
  useEffect(() => {
    let active = true;
    const fetchSignedLink = async () => {
      if (!docId || !docMeta) return;

      setLoading(true);
      setError(null);
      setXfaPreviewBlocked(false);
      setUsingFlattenedPreview(false);

      const linkType = getSecureLinkType(effectiveDoc, viewType);

      try {
        const response = await api.get(
          `/api/documents/${docId}/secure-link?type=${linkType}`
        );
        const data = response.data;

        if (!active) return;

        if (data.success && data.data.signedUrl) {
          const previewReady = data.data.previewReady !== false;
          if (linkType === 'preview' && !previewReady) {
            setXfaPreviewBlocked(true);
            setFileUrl(data.data.signedUrl);
          } else {
            setUsingFlattenedPreview(linkType === 'preview');
            setFileUrl(data.data.signedUrl);
          }
        } else {
          setError(data.message || 'Failed to generate secure PDF streaming token.');
        }
      } catch (err) {
        if (active) {
          setError('Failed to contact backend API server.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSignedLink();
  }, [docId, viewType, docMeta, effectiveDoc.type, effectiveDoc.hasXfa, linkRefreshKey]);

  const handleUploadPreview = useCallback(
    async (file) => {
      setUploadingPreview(true);
      setError(null);
      try {
        const res = await documentApi.uploadPreviewPdf(docId, file);
        if (res.data?.success) {
          setDocMeta(res.data.data);
          setXfaPreviewBlocked(false);
          setLinkRefreshKey((k) => k + 1);
        } else {
          setError(res.data?.message || 'Upload failed.');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Invalid preview file. Use Print → Save as PDF from Acrobat Reader after the form fully loads.'
        );
      } finally {
        setUploadingPreview(false);
      }
    },
    [docId]
  );

  const handlePreparePreview = useCallback(async () => {
    setPreparingPreview(true);
    setError(null);
    try {
      const res = await documentApi.preparePreview(docId);
      if (res.data?.success) {
        setXfaPreviewBlocked(false);
        const linkRes = await api.get(`/api/documents/${docId}/secure-link?type=preview`);
        if (linkRes.data?.success && linkRes.data.data.signedUrl) {
          setUsingFlattenedPreview(true);
          setFileUrl(linkRes.data.data.signedUrl);
          setUseFallback(false);
        }
      } else {
        setError(res.data?.message || 'Could not prepare preview.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Server could not flatten this XFA PDF. Install pdftk on the backend or re-upload as AcroForm.'
      );
    } finally {
      setPreparingPreview(false);
    }
  }, [docId]);

  // Adobe PDF Embed (AcroForm, flat, or server-flattened XFA only)
  useEffect(() => {
    if (
      xfaPreviewBlocked ||
      !sdkReady ||
      !fileUrl ||
      loading ||
      error ||
      useFallback
    ) {
      return;
    }

    let previewFailed = false;
    const viewDivId = `adobe-pdf-view-${docId}-${viewType}`;

    const renderAdobeView = async () => {
      try {
        const res = await fetch(fileUrl);
        if (res.status === 503) {
          setXfaPreviewBlocked(true);
          return;
        }
        if (!res.ok) throw new Error('Physical PDF content streaming failed.');
        const buffer = await res.arrayBuffer();

        if (isXfaPlaceholderBuffer(buffer)) {
          setXfaPreviewBlocked(true);
          return;
        }

        if (!window.AdobeDC) {
          throw new Error('Adobe PDF View SDK missing.');
        }

        const adobeDCView = new window.AdobeDC.View({
          clientId: ADOBE_CONFIG.CLIENT_ID,
          divId: viewDivId,
        });

        adobeDCView.registerCallback(
          window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
          (event) => {
            if (
              event.type === 'DOCUMENT_OPEN_FAILED' ||
              event.type === 'APP_RENDERING_FAILED'
            ) {
              if (!previewFailed) {
                previewFailed = true;
                setUseFallback(true);
              }
            }
          },
          {}
        );

        await adobeDCView.previewFile(
          {
            content: { promise: Promise.resolve(buffer) },
            metaData: { fileName },
          },
          getAdobeViewSettings(embedPdfType)
        );
      } catch (err) {
        console.error('Adobe Embed API error:', err);
        if (requiresXfaConversion) {
          setXfaPreviewBlocked(true);
        } else {
          setUseFallback(true);
        }
      }
    };

    renderAdobeView();
  }, [
    xfaPreviewBlocked,
    sdkReady,
    fileUrl,
    loading,
    error,
    docId,
    viewType,
    fileName,
    embedPdfType,
    useFallback,
    requiresXfaConversion,
  ]);

  if (loading || (docId && !docMeta)) {
    return <PdfLoadingState />;
  }

  if (viewType !== 'filled' && shouldUseHtmlFormViewer(effectiveDoc)) {
    return (
      <PdfHtmlFormViewer
        docId={docId}
        pdfTitle={effectiveDoc.pdfTitle || fileName}
      />
    );
  }

  if (error && !xfaPreviewBlocked) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">Failed to stream PDF</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  if (xfaPreviewBlocked) {
    return (
      <PdfXfaNotice
        url={fileUrl}
        fileName={fileName}
        pdfTitle={effectiveDoc.pdfTitle}
        liveCycleXfa={isLiveCycleXfa(effectiveDoc)}
        hasManualPreview={hasManualPreview(effectiveDoc)}
        onPreparePreview={isLiveCycleXfa(effectiveDoc) ? undefined : handlePreparePreview}
        onUploadPreview={handleUploadPreview}
        preparing={preparingPreview}
        uploading={uploadingPreview}
        prepareError={error}
      />
    );
  }

  if (useFallback || sdkError) {
    return (
      <div className="space-y-3">
        {effectiveDoc.hasXfa && !usingFlattenedPreview && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">
            This PDF includes XFA. Adobe Embed may not render it correctly — use Prepare preview
            or upload a flattened AcroForm copy.
          </p>
        )}
        <PdfFallback url={fileUrl} />
      </div>
    );
  }

  const viewDivId = `adobe-pdf-view-${docId}-${viewType}`;

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl">
      {usingFlattenedPreview && (
        <p className="absolute top-0 left-0 right-0 z-10 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          Showing server-flattened preview (Adobe Embed)
        </p>
      )}
      <div id={viewDivId} className="w-full h-full" ref={containerRef} />
    </div>
  );
};

export default PdfViewer;
