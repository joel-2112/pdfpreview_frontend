import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import AutofillForm from '../components/autofill/AutofillForm';
import PdfViewer from '../components/pdf/PdfViewer';
import Spinner from '../components/shared/Spinner';
import api from '../services/api';
import { Shield, Sparkles, Eye, Download, AlertTriangle, FileCheck, Layers, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../components/shared/Button';
import ErrorMessage from '../components/shared/ErrorMessage';
import PdfTypeDetector from '../components/pdf/PdfTypeDetector';

export const AutofillPage = () => {
  const location = useLocation();
  const { documents, loading, fetchDocuments } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  
  // States for secure downloading and errors
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    fetchDocuments();
    if (location.state && location.state.selectedDocId) {
      setSelectedDocId(location.state.selectedDocId);
    }
  }, [fetchDocuments, location.state]);

  const activeDoc = documents.find(d => d._id === selectedDocId);
  const isXfaDoc = activeDoc?.hasXfa || activeDoc?.type === 'XFA';

  // Whenever active document changes, reset preview and signed URLs
  useEffect(() => {
    setShowPreview(false);
    setError(null);
    setDownloadSuccess(false);
  }, [selectedDocId]);

  const handleGeneratePreview = () => {
    if (!selectedDocId || isXfaDoc) return;
    setPreviewKey(prev => prev + 1);
    setShowPreview(true);
    setDownloadSuccess(false);
  };

  // Safe download flow: Requests a temporary signed token from backend
  const handleSecureDownload = async () => {
    if (!activeDoc) return;
    setDownloadLoading(true);
    setError(null);
    setDownloadSuccess(false);
    
    try {
      const res = await api.post(`/api/documents/${activeDoc._id}/sign-url`, { viewType: 'filled' });
      const payload = res.data?.data || res.data;
      if (payload && payload.signedUrl) {
        const link = document.createElement('a');
        link.href = payload.signedUrl;
        link.setAttribute('download', `filled-${activeDoc.originalName}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        throw new Error("Failed to retrieve a secure streaming token.");
      }
    } catch (err) {
      setError("Unable to generate secure download link. Please ensure field mappings are valid.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Dynamic Profile Autofill
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            Live Stream
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Save your user variables, choose a parsed template, and instantly inject data into the PDF form.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 items-start">
        
        {/* Left Column: Form & Template Selector */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Template Selector Card */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <span>Target Output Template</span>
              </h3>
              {activeDoc && <PdfTypeDetector type={activeDoc.type} />}
            </div>

            {loading ? (
              <div className="py-3 flex justify-center">
                <Spinner size="sm" />
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="glass-input block w-full rounded-2xl py-3 px-4 text-sm font-medium cursor-pointer"
                >
                  <option value="">-- Choose a Form Template --</option>
                  {documents
                    .filter(d => d.fields && d.fields.length > 0)
                    .map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.originalName} ({doc.fields.length} fields) {doc.hasXfa ? '[XFA]' : ''}
                      </option>
                    ))}
                </select>
                {activeDoc && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Template: {activeDoc.originalName} • {activeDoc.fields?.length || 0} fillable fields
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedDocId || isXfaDoc}
              variant="gradient"
              className="w-full py-3"
              icon={Sparkles}
            >
              {isXfaDoc ? 'Autofill Blocked for Dynamic XFA' : 'Inject Profile & Preview'}
            </Button>
          </div>

          {/* Profile Form or XFA Notice */}
          {isXfaDoc ? (
            <div className="glass-panel rounded-3xl p-6 border border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 space-y-4">
              <div className="flex items-center space-x-3 text-amber-700 dark:text-amber-400">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-display font-bold tracking-tight">XFA Dynamic Form Detected</h4>
                  <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-mono">Server injection restricted</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This document is built on Adobe LiveCycle Dynamic XFA XML architecture. Programmatic form-filling is restricted due to proprietary binary scripts.
              </p>
              <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 p-4 border border-amber-200/80 dark:border-amber-500/20 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <strong className="text-slate-800 dark:text-slate-200 block">Recommended Action:</strong>
                <span>Download the original template from Documents tab and open inside the official <strong>Adobe Acrobat Reader</strong> desktop app.</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">
                      User Profile Schema
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Values used to populate mapped fields</p>
                  </div>
                </div>
              </div>
              <AutofillForm />
            </div>
          )}
        </div>

        {/* Right Column: Live PDF Canvas */}
        <div className="xl:col-span-7">
          {showPreview && activeDoc && !isXfaDoc ? (
            <div className="glass-panel rounded-3xl p-5 sm:p-6 border shadow-xl space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">
                    Populated Output View
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Live Stream: {activeDoc.originalName}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="primary" 
                    icon={Download}
                    onClick={handleSecureDownload}
                    loading={downloadLoading}
                    disabled={downloadLoading}
                  >
                    Download Filled PDF
                  </Button>
                </div>
              </div>

              {downloadSuccess && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Your filled document has been generated and download started!</span>
                </div>
              )}

              {/* Embedded PDF Viewer */}
              <PdfViewer
                key={previewKey}
                docId={activeDoc._id}
                viewType="filled"
                fileName={`filled-${activeDoc.originalName}`}
                pdfType={activeDoc.type}
                hasXfa={activeDoc.hasXfa}
              />
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 animate-float">
                <Eye className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Live Preview Canvas
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isXfaDoc 
                    ? "Dynamic XFA templates cannot be previewed in autofill mode. Select a standard AcroForm template to test the stream injection."
                    : "Fill out your profile schema on the left, choose a parsed template, and click \"Inject Profile & Preview\" to view the populated document in real-time."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutofillPage;