import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../../services/api';
import documentApi from '../../services/document.api';
import PdfLoadingState from './PdfLoadingState';
import { AlertTriangle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Eye, Download } from 'lucide-react';

// Setup global worker with proper extension matching your current bundler settings
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfViewer = ({
  docId,
  viewType = 'original',
  fileName = 'document.pdf',
  pdfType: pdfTypeProp,
  hasXfa: hasXfaProp,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [docMeta, setDocMeta] = useState(null);
  
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  // --- New state for XFA FormVu preview ---
  const [xfaPreviewMode, setXfaPreviewMode] = useState(null); // null = not decided, 'formvu', 'download'
  const [formvuHtmlUrl, setFormvuHtmlUrl] = useState('');
  const [isXfaDocument, setIsXfaDocument] = useState(false);

  // Memoize pdf.js options
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), []);

  // Fetch document metadata to detect XFA
  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const res = await documentApi.getOne(docId);
        if (active && res.data?.success) {
          const meta = res.data.data;
          setDocMeta(meta);
          // Determine if this is an XFA form (type field or hasXfa flag)
          const isXfa = meta.type === 'XFA' || meta.hasXfa === true;
          setIsXfaDocument(isXfa);
        }
      } catch (err) {
        console.warn('Could not load doc meta', err);
      }
    };
    if (docId) loadMeta();
    return () => { active = false; };
  }, [docId]);

  // Fetch signed URL for AcroForm (original or filled) - only used for non-XFA
  const fetchSignedLink = useCallback(async () => {
    if (isXfaDocument && xfaPreviewMode !== 'formvu') {
      // For XFA, we don't fetch a signed link for react-pdf (it would fail anyway)
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/documents/${docId}/secure-link?type=${viewType}`);
      const data = response.data;
      if (data.success && data.data.signedUrl) {
        // Check if XFA preview needs flattening (old logic – we now handle XFA separately)
        if (viewType === 'preview' && data.data.needsXfaPreview && !data.data.previewReady) {
          // This path is only for hybrid AcroForm/XFA – but we already treat pure XFA separately.
          // For safety, we keep the old handling.
          try {
            await api.post(`/api/documents/${docId}/prepare-preview`);
            const retryResponse = await api.get(`/api/documents/${docId}/secure-link?type=${viewType}`);
            if (retryResponse.data?.success && retryResponse.data.data.signedUrl) {
              setFileUrl(retryResponse.data.data.signedUrl);
            } else {
              setError('XFA form requires flattening. Please upload a flattened preview PDF or open in Adobe Acrobat Reader.');
            }
          } catch (prepareError) {
            setError('XFA form requires flattening. Please upload a flattened preview PDF or open in Adobe Acrobat Reader.');
          }
        } else {
          setFileUrl(data.data.signedUrl);
        }
      } else {
        setError(data.message || 'Failed to generate secure PDF streaming token.');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to contact backend API server.');
    } finally {
      setLoading(false);
    }
  }, [docId, viewType, isXfaDocument, xfaPreviewMode]);

  // Fetch FormVu HTML preview URL when user chooses that mode
  const fetchFormvuPreview = useCallback(async () => {
    if (!isXfaDocument) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/xfa/preview/${docId}`);
      const data = response.data;
      if (data.success && data.data.htmlPreviewUrl) {
        setFormvuHtmlUrl(data.data.htmlPreviewUrl);
      } else {
        setError(data.message || 'FormVu preview generation failed.');
      }
    } catch (err) {
      console.error('FormVu preview error:', err);
      setError('Failed to generate FormVu preview. Please check backend logs.');
    } finally {
      setLoading(false);
    }
  }, [docId, isXfaDocument]);

  // Decide when to fetch signed link based on XFA status and preview mode
  useEffect(() => {
    if (!docId) return;
    if (isXfaDocument) {
      if (xfaPreviewMode === 'formvu') {
        fetchFormvuPreview();
      } else if (xfaPreviewMode === 'download') {
        // Show download option only – no preview
        setLoading(false);
      } else {
        // User hasn't chosen yet – stop loading and show choice UI
        setLoading(false);
      }
    } else {
      fetchSignedLink();
    }
  }, [docId, isXfaDocument, xfaPreviewMode, fetchSignedLink, fetchFormvuPreview]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError(error.message || 'Failed to load PDF');
    setLoading(false);
  };

  // --- XFA Choice UI ---
  if (isXfaDocument && !xfaPreviewMode) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-500" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">XFA Form Detected</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-4">
          This document uses the XFA format, which cannot be previewed directly in browsers.  
          You have two options:
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setXfaPreviewMode('formvu')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview with FormVu (Beta, watermarked)
          </button>
          <button
            onClick={() => setXfaPreviewMode('download')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download original XFA PDF
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Note: FormVu preview uses a cloud service and may have a watermark. For official submissions, use Adobe Acrobat Reader.
        </p>
      </div>
    );
  }

  // --- XFA Download mode (no preview) ---
  if (isXfaDocument && xfaPreviewMode === 'download') {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 p-6 text-center">
        <Download className="mb-4 h-12 w-12 text-slate-600 dark:text-slate-400" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">Download XFA Form</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-4">
          This form must be opened with Adobe Acrobat Reader (desktop) to fill and submit.
        </p>
        <a
          href={fileUrl || `#`}
          download={fileName}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>
    );
  }

  // --- XFA FormVu HTML preview mode ---
  if (isXfaDocument && xfaPreviewMode === 'formvu') {
    if (loading) return <PdfLoadingState />;
    if (error) {
      return (
        <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
          <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">FormVu Preview Failed</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
          <button
            onClick={() => setXfaPreviewMode(null)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Go back
          </button>
        </div>
      );
    }
    if (!formvuHtmlUrl) return <PdfLoadingState />;
    return (
      <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setXfaPreviewMode(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to options
            </button>
          </div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            FormVu Preview (Beta – watermarked)
          </span>
        </div>
        <iframe
          src={formvuHtmlUrl}
          className="flex-1 w-full border-0"
          title="XFA Form Preview"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    );
  }

  // --- AcroForm (standard PDF) preview using react-pdf ---
  if (loading || (docId && !docMeta)) {
    return <PdfLoadingState />;
  }

  if (error) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">Failed to load PDF</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          This PDF may use an unsupported format. Try opening it in Adobe Acrobat Reader.
        </p>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-500" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">No PDF URL available</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
          The PDF URL could not be generated. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] min-h-[500px] flex flex-col border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ZoomOut className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(3, s + 0.25))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ZoomIn className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-4 flex justify-center custom-scrollbar">
        {fileUrl && (
          <Document
            key={fileUrl}
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<PdfLoadingState />}
            error={
              <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                Failed to load PDF using react-pdf.
              </div>
            }
            options={pdfOptions}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              renderInteractiveForms={true}
              renderStructTree={false} 
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;