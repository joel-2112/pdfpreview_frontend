import React, { useState, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export const PdfJsViewer = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    setError(error.message || 'Failed to load PDF');
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (error) {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This PDF may use an unsupported format. Try opening it in Adobe Acrobat Reader.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-[calc(100vh-12rem)] min-h-[500px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-lg">
      <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {fileName || 'document.pdf'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
            className="px-3 py-1 text-sm rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={nextPage}
            className="px-3 py-1 text-sm rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto w-full bg-slate-100 dark:bg-slate-950 flex justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        )}
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="flex items-center justify-center h-full">Loading PDF...</div>}
          error={<div className="text-red-600">Failed to load PDF</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={1.2}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfJsViewer;
