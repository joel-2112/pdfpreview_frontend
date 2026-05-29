import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import Button from '../shared/Button';

export const PdfToolbar = ({ scale, setScale, downloadUrl, fileName }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border border-slate-800 bg-slate-900/40 backdrop-blur rounded-xl mb-4.5">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          title="Zoom Out"
        >
          <ZoomOut className="h-4.5 w-4.5" />
        </button>
        <span className="text-xs font-semibold text-slate-300 w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          title="Zoom In"
        >
          <ZoomIn className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={() => setScale(1.0)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700"
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {downloadUrl && (
        <a href={downloadUrl} download={fileName} className="no-underline">
          <Button size="sm" variant="secondary" icon={Download}>
            Download Original
          </Button>
        </a>
      )}
    </div>
  );
};

export default PdfToolbar;
