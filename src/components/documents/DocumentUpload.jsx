import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Sparkles, FileCheck, Layers, ShieldAlert } from 'lucide-react';
import Spinner from '../shared/Spinner';

export const DocumentUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setMessage('Invalid file type. Only standard Adobe PDF documents are supported.');
      return;
    }

    setUploading(true);
    setProgress(15);
    setStatus(null);
    setMessage('');

    try {
      const documentApi = (await import('../../services/document.api')).default;
      const res = await documentApi.upload(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(Math.max(15, percentCompleted));
      });
      
      if (res.data.success) {
        setStatus('success');
        setMessage(`Successfully ingested & indexed: ${file.name}`);
        if (onUploadSuccess) onUploadSuccess(res.data.data);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setStatus('error');
      const parseError = (await import('../../utils/errorHandler')).default;
      setMessage(parseError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <form
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[200px] p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 select-none ${
          dragActive
            ? 'border-brand-500 bg-brand-500/10 scale-[1.005] shadow-lg shadow-brand-500/10'
            : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 hover:border-brand-400 dark:hover:border-brand-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center w-full max-w-sm space-y-4 text-center">
            <div className="relative">
              <Spinner size="lg" />
              <FileText className="absolute inset-0 m-auto h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>

            <div className="space-y-1">
              <span className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Parsing PDF layout structure...
              </span>
              <p className="text-xs text-slate-500 font-mono">
                Extracting AcroForm tags & field dictionaries
              </p>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-brand-600 to-cyan-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
              {progress}% processed
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-white">
                Drag and drop your PDF template here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                or <span className="text-brand-600 dark:text-brand-400 font-semibold underline">browse files</span> from your computer
              </p>
            </div>

            {/* Supported Format Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-semibold">
                <FileCheck className="h-3 w-3" />
                <span>Standard AcroForm</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-semibold">
                <Layers className="h-3 w-3" />
                <span>Dynamic XFA Forms</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold">
                <FileText className="h-3 w-3" />
                <span>Flat PDF</span>
              </span>
            </div>
          </div>
        )}
      </form>

      {status && (
        <div className={`flex items-center space-x-3 rounded-2xl border p-4 text-sm animate-fade-in shadow-sm ${
          status === 'success'
            ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
            : 'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span className="font-medium leading-relaxed">{message}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;