import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import AutofillForm from '../components/autofill/AutofillForm';
import PdfViewer from '../components/pdf/PdfViewer';
import Spinner from '../components/shared/Spinner';
import { Shield, Sparkles, Eye, Download } from 'lucide-react';
import Button from '../components/shared/Button';

export const AutofillPage = () => {
  const location = useLocation();
  const { documents, loading, fetchDocuments } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetchDocuments();
    if (location.state && location.state.selectedDocId) {
      setSelectedDocId(location.state.selectedDocId);
    }
  }, [fetchDocuments, location.state]);

  const activeDoc = documents.find(d => d._id === selectedDocId);

  const handleGeneratePreview = () => {
    if (!selectedDocId) return;
    setPreviewKey(prev => prev + 1);
    setShowPreview(true);
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 items-start">
        {/* Left Side: Profile Form */}
        <div className="xl:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl space-y-6">
            <h4 className="text-base font-bold text-white tracking-tight border-b border-slate-850 pb-3 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-brand-400 shrink-0" />
              <span>User Profile Variables</span>
            </h4>
            <AutofillForm />
          </div>

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
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  setShowPreview(false);
                }}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 px-4 text-sm text-slate-300 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
              >
                <option value="">-- Choose Template --</option>
                {documents
                  .filter(d => d.fields && d.fields.length > 0)
                  .map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.originalName} ({doc.fields.length} fields)
                    </option>
                  ))}
              </select>
            )}

            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedDocId}
              variant="primary"
              className="w-full"
              icon={Sparkles}
            >
              Inject Data & Preview
            </Button>
          </div>
        </div>

        {/* Right Side: Embedded Live PDF Previewer */}
        <div className="xl:col-span-7">
          {showPreview && activeDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3.5">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Filled Document View</h4>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {activeDoc.originalName} (Stripped {activeDoc.type})
                  </span>
                </div>
                
                {/* Download Button */}
                <a
                  href={`/api/documents/${activeDoc._id}/secure-view?token=${localStorage.getItem('token')}&type=filled`}
                  download={`filled-${activeDoc.originalName}`}
                  className="no-underline"
                >
                  <Button size="sm" variant="outline" icon={Download}>
                    Download Filled
                  </Button>
                </a>
              </div>

              {/* Embed Frame */}
              <PdfViewer
                key={previewKey}
                docId={activeDoc._id}
                viewType="filled"
                fileName={`filled-${activeDoc.originalName}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border border-slate-850 bg-slate-950/20 rounded-2xl p-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-600">
                <Eye className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-400">Live Preview Canvas</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Save your profile data, select an output template on the left, and click "Inject Data & Preview" to render the filled PDF.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutofillPage;
