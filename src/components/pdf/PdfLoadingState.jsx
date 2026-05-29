import React from 'react';

export const PdfLoadingState = () => {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-12rem)] min-h-[500px] border border-slate-800 bg-slate-900 rounded-2xl p-6 space-y-4 animate-pulse">
      {/* Fake Toolbar */}
      <div className="h-10 w-full bg-slate-800 rounded-lg" />
      
      {/* Fake Pages */}
      <div className="flex-1 flex space-x-6 justify-center">
        <div className="w-[45%] h-full bg-slate-800 rounded-lg shadow-inner" />
        <div className="hidden md:block w-[45%] h-full bg-slate-800 rounded-lg shadow-inner" />
      </div>
      
      {/* Fake Footer */}
      <div className="h-6 w-48 bg-slate-800 rounded-md self-center" />
    </div>
  );
};

export default PdfLoadingState;
