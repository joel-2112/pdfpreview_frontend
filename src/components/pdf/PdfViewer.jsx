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
      <div className="glass-panel flex min-h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-float">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Dynamic XFA Architecture Detected
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            This document utilizes Adobe XML Forms Architecture (XFA). Standard browser PDF viewers cannot parse active scripts directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => setXfaPreviewMode('formvu')}
            variant="primary"
            size="md"
            icon={Eye}
          >
            Preview via FormVu Cloud Engine
          </Button>
          <Button
            onClick={() => setXfaPreviewMode('download')}
            variant="outline"
            size="md"
            icon={Download}
          >
            Download Raw XFA File
          </Button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          For official enterprise signing and submissions, use Adobe Acrobat Reader.
        </p>
      </div>
    );
  }

  // --- XFA Download mode (no preview) ---
  if (isXfaDocument && xfaPreviewMode === 'download') {
    return (
      <div className="glass-panel flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <Download className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Download Adobe XFA Template
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This template is ready for local filling inside the Adobe Acrobat Reader desktop application.
          </p>
        </div>
        <a
          href={fileUrl || `#`}
          download={fileName}
          className="inline-block"
        >
          <Button variant="primary" size="md" icon={Download}>
            Download PDF Now
          </Button>
        </a>
      </div>
    );
  }

  // --- XFA FormVu HTML preview mode ---
  if (isXfaDocument && xfaPreviewMode === 'formvu') {
    if (loading) return <PdfLoadingState />;
    if (error) {
      return (
        <div className="glass-panel flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-8 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
            FormVu Preview Unavailable
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
          <Button
            onClick={() => setXfaPreviewMode(null)}
            variant="outline"
            size="sm"
          >
            ← Return to options
          </Button>
        </div>
      );
    }
    if (!formvuHtmlUrl) return <PdfLoadingState />;
    return (
      <div className="relative w-full h-[calc(100vh-14rem)] min-h-[520px] flex flex-col border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0c1222] rounded-3xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-white/[0.08] shrink-0">
          <button
            onClick={() => setXfaPreviewMode(null)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            ← Back to Options
          </button>
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
            FormVu Dynamic XFA Stream
          </span>
        </div>
        <iframe
          src={formvuHtmlUrl}
          className="flex-1 w-full border-0 bg-white"
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
      <div className="glass-panel flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-8 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
        <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
          Failed to load PDF Stream
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="glass-panel flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-8 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
          PDF Token Expired or Unavailable
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
          The PDF stream URL could not be generated. Please try reloading the view.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-14rem)] min-h-[540px] flex flex-col border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#070c18] rounded-3xl overflow-hidden shadow-xl">
      {/* Precision PDF Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] shrink-0 z-10">
        
        {/* Page navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            Page {pageNumber} / {numPages || '--'}
          </div>

          <button 
            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Fit controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button 
            onClick={() => setScale(s => Math.min(2.5, s + 0.25))}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Viewport Canvas */}
      <div className="flex-1 overflow-auto bg-slate-200/50 dark:bg-[#070c18] p-4 sm:p-8 flex justify-center custom-scrollbar">
        {fileUrl && (
          <div className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 bg-white inline-block my-auto">
            <Document
              key={fileUrl}
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<PdfLoadingState />}
              error={
                <div className="text-rose-600 bg-rose-50 p-6 rounded-2xl text-xs font-semibold">
                  Failed to load PDF using react-pdf rendering pipeline.
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;