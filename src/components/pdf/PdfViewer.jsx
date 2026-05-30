import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../../services/api';
import documentApi from '../../services/document.api';
import { PDF_TYPES } from '../../constants/pdfTypes';
import PdfLoadingState from './PdfLoadingState';
import { AlertTriangle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const res = await documentApi.getOne(docId);
        if (active && res.data?.success) {
          setDocMeta(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load doc meta', err);
      }
    };
    if (docId) loadMeta();
    return () => { active = false; };
  }, [docId]);

  useEffect(() => {
    if (!docId) return undefined;
    let active = true;
    
    const fetchSignedLink = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/api/documents/${docId}/secure-link?type=${viewType}`);
        const data = response.data;
        if (!active) return;

        if (data.success && data.data.signedUrl) {
          setFileUrl(data.data.signedUrl);
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
    return () => { active = false; };
  }, [docId, viewType]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  if (loading || (docId && !docMeta)) {
    return <PdfLoadingState />;
  }

  if (error) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-500" />
        <h4 className="mb-2 font-bold text-slate-900 dark:text-white text-base">Failed to stream PDF</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
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
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<PdfLoadingState />}
            error={
              <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                Failed to load PDF using react-pdf.
              </div>
            }
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@4.4.162/cmaps/',
              cMapPacked: true,
            }}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              renderInteractiveForms={true}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
