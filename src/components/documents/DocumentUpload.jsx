import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Spinner from '../shared/Spinner';

export const DocumentUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success', 'error'
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
    if (file.type !== "application/pdf") {
      setStatus('error');
      setMessage('Only PDF documents are supported.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus(null);
    setMessage('');

    try {
      const documentApi = (await import('../../services/document.api')).default;
      const res = await documentApi.upload(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      
      if (res.data.success) {
        setStatus('success');
        setMessage(`Successfully uploaded and parsed: ${file.name}`);
        if (onUploadSuccess) onUploadSuccess(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      const parseError = (await import('../../utils/errorHandler')).default;
      setMessage(parseError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[220px] p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center w-full max-w-xs space-y-4">
            <Spinner size="md" />
            <span className="text-sm font-semibold text-slate-300">
              Parsing PDF layout structure...
            </span>
            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{progress}% uploaded</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-850 text-brand-400 group-hover:text-brand-300 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drag and drop your PDF here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse from local disk</p>
            </div>
            <span className="inline-block px-3 py-1 bg-slate-950/40 border border-slate-850 rounded-lg text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Acroform & static XFA supported
            </span>
          </div>
        )}
      </form>

      {status && (
        <div className={`mt-4 flex items-center space-x-3 rounded-xl border p-4 text-sm animate-fade-in ${
          status === 'success'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            : 'border-red-500/20 bg-red-500/10 text-red-400'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="font-semibold">{message}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
