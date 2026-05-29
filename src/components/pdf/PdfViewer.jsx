import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import usePdfViewer from '../../hooks/usePdfViewer';
import api from '../../services/api';
import documentApi from '../../services/document.api';
import { ADOBE_CONFIG, getAdobeViewSettings } from '../../constants/adobeConfig';
import { PDF_TYPES } from '../../constants/pdfTypes';
import {
  isXfaDocument,
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
  const [forceHtmlMode, setForceHtmlMode] = useState(false);
  const [xfaPreviewBlocked, setXfaPreviewBlocked] = useState(false);
  const [usingFlattenedPreview, setUsingFlattenedPreview] = useState(false);
  const [preparingPreview, setPreparingPreview] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [linkRefreshKey, setLinkRefreshKey] = useState(0);

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
    hasXfa: Boolean(hasXfaProp),
    fields: [],
  };

  const useHtmlViewer = useMemo(
    () =>
      viewType !== 'filled' &&
      shouldUseHtmlFormViewer(effectiveDoc, { forceHtml: forceHtmlMode }),
    [viewType, effectiveDoc, forceHtmlMode]
  );

  const embedPdfType = getEffectivePdfTypeForViewer(effectiveDoc, usingFlattenedPreview);

  // PDF stream + Adobe Embed — skipped entirely for XFA (HTML viewer)
  useEffect(() => {
    if (!docId || !docMeta || useHtmlViewer) return undefined;

    let active = true;
    const fetchSignedLink = async () => {
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
      } catch {
        if (active) setError('Failed to contact backend API server.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSignedLink();
    return () => {
      active = false;
    };
  }, [docId, viewType, docMeta, useHtmlViewer, effectiveDoc, linkRefreshKey]);

  useEffect(() => {
    if (useHtmlViewer || xfaPreviewBlocked || !sdkReady || !fileUrl || loading || error || useFallback) {
      return undefined;
    }

    let previewFailed = false;
    const viewDivId = `adobe-pdf-view-${docId}-${viewType}`;

    const renderAdobeView = async () => {
      try {
        const res = await fetch(fileUrl);
        if (res.status === 503) {
          setForceHtmlMode(true);
          return;
        }
        if (!res.ok) throw new Error('Physical PDF content streaming failed.');
        const buffer = await res.arrayBuffer();

        if (isXfaPlaceholderBuffer(buffer)) {
          setForceHtmlMode(true);
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
                if (isXfaDocument(effectiveDoc)) {
                  setForceHtmlMode(true);
                } else {
                  setUseFallback(true);
                }
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
        if (isXfaDocument(effectiveDoc)) {
          setForceHtmlMode(true);
        } else {
          setUseFallback(true);
        }
      }
    };

    renderAdobeView();
    return undefined;
  }, [
    useHtmlViewer,
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
    effectiveDoc,
  ]);

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
          'Server could not flatten this XFA PDF.'
      );
    } finally {
      setPreparingPreview(false);
    }
  }, [docId]);

  const handleReanalyze = useCallback(async () => {
    try {
      const res = await documentApi.reanalyze(docId);
      if (res.data?.success) {
        setDocMeta(res.data.data);
        setForceHtmlMode(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Re-analyze failed.');
    }
  }, [docId]);

  if (loading && !useHtmlViewer) {
    return <PdfLoadingState />;
  }

  if (docId && !docMeta) {
    return <PdfLoadingState />;
  }

  if (useHtmlViewer) {
    return (
      <PdfHtmlFormViewer
        docId={docId}
        pdfTitle={effectiveDoc.pdfTitle || fileName}
        onReanalyze={handleReanalyze}
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
        onReanalyze={handleReanalyze}
        preparing={preparingPreview}
        uploading={uploadingPreview}
        prepareError={error}
      />
    );
  }

  if (useFallback || sdkError) {
    if (isXfaDocument(effectiveDoc)) {
      return (
        <PdfHtmlFormViewer
          docId={docId}
          pdfTitle={effectiveDoc.pdfTitle || fileName}
          onReanalyze={handleReanalyze}
        />
      );
    }
    return (
      <div className="space-y-3">
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
