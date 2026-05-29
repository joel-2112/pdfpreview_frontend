import React from 'react';
import { ShieldAlert, Download } from 'lucide-react';
import Button from '../shared/Button';

export const PdfFallback = ({ url }) => {
  return (
    <div className="relative flex flex-col w-full h-[calc(100vh-12rem)] min-h-[500px] border border-slate-800 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Banner */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-850 bg-slate-900/50">
        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
          <span>Using standard HTML5 native fallback viewer.</span>
        </div>
        
        <a href={url} download className="no-underline">
          <Button size="sm" variant="outline" icon={Download}>
            Download PDF
          </Button>
        </a>
      </div>

      {/* Frame view */}
      <div className="flex-1 bg-slate-950">
        <iframe
          src={`${url}#toolbar=1&navpanes=0`}
          title="PDF Fallback Viewer"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};

export default PdfFallback;
