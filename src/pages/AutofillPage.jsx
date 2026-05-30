import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import AutofillForm from '../components/autofill/AutofillForm';
import PdfViewer from '../components/pdf/PdfViewer';
import Spinner from '../components/shared/Spinner';
import api from '../services/api';
import { Shield, Sparkles, Eye, Download, AlertTriangle } from 'lucide-react';
import Button from '../components/shared/Button';
import ErrorMessage from '../components/shared/ErrorMessage';

export const AutofillPage = () => {
  const location = useLocation();
  const { documents, loading, fetchDocuments } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  
  // States for secure downloading and errors
  const [signedDownloadUrl, setSignedDownloadUrl] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setSignedDownloadUrl('');
    setError(null);
  }, [selectedDocId]);

  const handleGeneratePreview = () => {
    if (!selectedDocId || isXfaDoc) return;
    setPreviewKey(prev => prev + 1);
    setShowPreview(true);
    setSignedDownloadUrl(''); // Reset download URL until requested
  };

  // Safe download flow: Requests a temporary signed token from backend
  const handleSecureDownload = async () => {
    if (!activeDoc) return;
    setDownloadLoading(true);
    setError(null);
    
    try {
      // Endpoint that signs the URL request securely
      const res = await api.post(`/api/documents/${activeDoc._id}/sign-url`, { viewType: 'filled' });
      const payload = res.data?.data || res.data;
      if (payload && payload.signedUrl) {
        setSignedDownloadUrl(payload.signedUrl);
        
        // Programmatic trigger for seamless downloading
        const link = document.createElement('a');
        link.href = payload.signedUrl;
        link.setAttribute('download', `filled-${activeDoc.originalName}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        throw new Error("Failed to retrieve a secure streaming token.");
      }
    } catch (err) {
      setError("Unable to generate secure download link. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Dynamic Profile Autofill
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Populate user variables and stream preview injections instantly.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 items-start">
        {/* Left Side: Profile Form & Guard */}
        <div className="xl:col-span-5 space-y-6">
          {isXfaDoc ? (
            /* XFA Guard Warning Notice */
            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 text-amber-500">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h4 className="text-base font-bold tracking-tight">Autofill Guard Active</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The template you selected is an <strong className="text-amber-400">XFA Dynamic PDF</strong>. 
                Web-server data injection and programmatic field mappings are heavily restricted on XFA formats due to embedded proprietary logic.
              </p>
              <div className="rounded-xl bg-slate-950/40 p-3.5 border border-slate-800 text-[11px] text-slate-500">
                <strong>Action Needed:</strong> Please head back to the main document archive, download this form directly, and execute the inputs inside the official <strong>Adobe Acrobat Reader</strong> desktop app.
              </div>
            </div>
          ) : (
            /* Standard Active Profile Form */
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl space-y-6">
              <h4 className="text-base font-bold text-white tracking-tight border-b border-slate-850 pb-3 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-brand-400 shrink-0" />
                <span>User Profile Variables</span>
              </h4>
              <AutofillForm />
            </div>
          )}

          {/* PDF Selector & Action */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Select Output Document Template
            </h4>

            {loading ? (
              <Spinner size="sm" />
            ) : (
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 px-4 text-sm text-slate-300 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
              >
                <option value="">-- Choose Template --</option>
                {documents
                  .filter(d => d.fields && d.fields.length > 0)
                  .map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.originalName} ({doc.fields.length} fields) {doc.hasXfa ? '[XFA]' : ''}
                    </option>
                  ))}
              </select>
            )}

            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedDocId || isXfaDoc}
              variant="primary"
              className="w-full"
              icon={Sparkles}
            >
              {isXfaDoc ? 'Autofill Blocked for XFA' : 'Inject Data & Preview'}
            </Button>
          </div>
        </div>

        {/* Right Side: Embedded Live PDF Previewer */}
        <div className="xl:col-span-7">
          {showPreview && activeDoc && !isXfaDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3.5">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Filled Document View</h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {activeDoc.originalName} (Stripped {activeDoc.type})
                  </span>
                </div>
                
                {/* Secure Download Trigger */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={Download}
                  onClick={handleSecureDownload}
                  loading={downloadLoading}
                  disabled={downloadLoading}
                >
                  Download Filled
                </Button>
              </div>

              {/* Embed Frame */}
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
            <div className="flex flex-col items-center justify-center h-[500px] border border-slate-850 bg-slate-950/20 rounded-2xl p-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-600">
                <Eye className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-400">Live Preview Canvas</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {isXfaDoc 
                  ? "XFA forms cannot be filled or previewed here. Select a standard Flat/AcroForm template to run the injection engine."
                  : "Save your profile data, select an output template on the left, and click \"Inject Data & Preview\" to render the filled PDF."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutofillPage;