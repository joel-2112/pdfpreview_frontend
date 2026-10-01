import React from 'react';
import Spinner from '../shared/Spinner';

export const PdfLoadingState = () => {
  return (
    <div className="relative flex flex-col w-full h-[calc(100vh-14rem)] min-h-[500px] border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/70 dark:bg-slate-900/50 rounded-3xl p-6 space-y-4 overflow-hidden">
      {/* Skeleton Toolbar */}
      <div className="h-11 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl animate-pulse" />
      
      {/* Skeleton Pages */}
      <div className="flex-1 flex space-x-6 justify-center items-center py-6">
        <div className="w-[85%] sm:w-[55%] h-full bg-white dark:bg-slate-800/60 rounded-2xl shadow-md border border-slate-200/80 dark:border-white/[0.06] animate-pulse flex flex-col items-center justify-center space-y-4 p-8">
          <Spinner size="lg" />
          <div className="space-y-1.5 text-center">
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block">
              Rendering AcroForm Vector Elements...
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Loading Adobe PDF interactive layers
            </span>
          </div>
        </div>
      </div>
      
      {/* Skeleton Footer */}
      <div className="h-5 w-40 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg self-center animate-pulse" />
    </div>
  );
};

export default PdfLoadingState;

