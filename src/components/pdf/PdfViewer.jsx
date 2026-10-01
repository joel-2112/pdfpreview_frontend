import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'pdfjs-dist/web/pdf_viewer.css';
import api from '../../services/api';
import documentApi from '../../services/document.api';
import PdfLoadingState from './PdfLoadingState';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  FileText, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';
import Button from '../shared/Button';

// Setup global worker with proper extension matching Vite bundler
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Custom XFA Layer Renderer Component
 * Renders Mozilla PDF.js dynamic XFA XML DOM elements onto the PDF page viewport
 */
const XfaPageLayer = ({ page, scale, rotate }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!page || !containerRef.current) return;
    let cancelled = false;

    const renderXfa = async () => {
      try {
        if (typeof page.getXfa === 'function') {
          const xfa = await page.getXfa();
          if (xfa && xfa.html && containerRef.current && !cancelled) {
            containerRef.current.innerHTML = '';
            const viewport = page.getViewport({ scale: scale || 1, rotation: rotate || 0 });

            containerRef.current.style.width = `${Math.floor(viewport.width)}px`;
            containerRef.current.style.height = `${Math.floor(viewport.height)}px`;

            if (pdfjs.XfaLayer) {
              pdfjs.XfaLayer.render({
                viewport,
                div: containerRef.current,
                xfaHtml: xfa.html,
                linkService: {
                  addLinkAttributes: (element, url, newWindow) => {
                    element.href = url;
                    if (newWindow) element.target = '_blank';
                  },
                },
                annotationStorage: page.annotationStorage || null,
                intent: 'display',
              });
            }
          }
        }
      } catch (err) {
        console.warn('XFA foreground layer notice:', err);
      }
    };

    renderXfa();
    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [page, scale, rotate]);

  return (
    <div
      ref={containerRef}
      className="xfaLayer xfaFont"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
      }}
    />
  );
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isXfaActive, setIsXfaActive] = useState(false);

  // Memoize pdf.js options with full XFA and font rendering capabilities enabled
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    enableXfa: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  // Fetch document metadata
  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const res = await documentApi.getOne(docId);
        if (active && res.data?.success) {
          const meta = res.data.data;
          setDocMeta(meta);
          const isXfa = meta.type === 'XFA' || meta.hasXfa === true;
          setIsXfaActive(isXfa);
        }
      } catch (err) {
        console.warn('Could not load doc meta', err);
      }
    };
    if (docId) loadMeta();
    return () => { active = false; };
  }, [docId]);

  // Fetch signed PDF streaming link
  const fetchSignedLink = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/documents/${docId}/secure-link?type=${viewType}`);
      const data = response.data;
      if (data.success && data.data.signedUrl) {
        setFileUrl(data.data.signedUrl);
        if (data.data.isXfa) {
          setIsXfaActive(true);
        }
      } else {
        setError(data.message || 'Failed to generate secure PDF streaming token.');
      }
    } catch (err) {
      console.error('PDF stream link error:', err);
      setError('Failed to contact backend API server for PDF stream.');
    } finally {
      setLoading(false);
    }
  }, [docId, viewType]);

  useEffect(() => {
    if (docId) {
      fetchSignedLink();
    }
  }, [docId, fetchSignedLink]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError(error.message || 'Failed to parse PDF document.');
    setLoading(false);
  };

  if (loading || (docId && !docMeta && !fileUrl)) {
    return <PdfLoadingState />;
  }

  if (error) {
    return (
      <div className="glass-panel flex min-h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-float">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
            Failed to Load PDF Document
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={fetchSignedLink}
            variant="outline"
            size="sm"
            icon={RefreshCw}
          >
            Retry Stream
          </Button>
          {fileUrl && (
            <a href={fileUrl} download={fileName} className="inline-block">
              <Button variant="primary" size="sm" icon={Download}>
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full flex flex-col border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/90 dark:bg-[#070c18] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[calc(100vh-14rem)] min-h-[560px]'}`}>
      {/* Precision PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] shrink-0 z-10 shadow-xs">
        
        {/* Left: Engine status & Document Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline truncate max-w-[180px]">
              {fileName}
            </span>
          </div>

          {isXfaActive && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Dynamic XFA Active</span>
            </div>
          )}
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
            Page {pageNumber} <span className="opacity-50">/</span> {numPages || '--'}
          </div>

          <button 
            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Layout actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, Number((s - 0.2).toFixed(1))))}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setScale(1.0)}
            className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <button 
            onClick={() => setScale(s => Math.min(2.5, Number((s + 0.2).toFixed(1))))}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          <button 
            onClick={() => setIsFullscreen(f => !f)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors inline-flex items-center"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Document Viewport Canvas */}
      <div className="flex-1 overflow-auto bg-slate-200/60 dark:bg-[#060a14] p-4 sm:p-8 flex justify-center custom-scrollbar">
        {fileUrl && (
          <div className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 bg-white inline-block my-auto max-w-full">
            <Document
              key={fileUrl}
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<PdfLoadingState />}
              error={
                <div className="p-8 text-center text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-2xl">
                  Failed to render PDF using PDF.js engine.
                </div>
              }
              options={pdfOptions}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                renderForms={true}
                renderStructTree={false} 
              >
                {({ page, scale: pageScale, rotate: pageRotate }) => (
                  <XfaPageLayer 
                    page={page} 
                    scale={pageScale} 
                    rotate={pageRotate} 
                  />
                )}
              </Page>
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;