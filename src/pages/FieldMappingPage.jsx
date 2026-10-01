import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import FieldMapper from '../components/autofill/FieldMapper';
import Spinner from '../components/shared/Spinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ArrowLeftRight, FileSpreadsheet, Sparkles, FileText, Layers } from 'lucide-react';
import PdfTypeDetector from '../components/pdf/PdfTypeDetector';

export const FieldMappingPage = () => {
  const [searchParams] = useSearchParams();
  const { documents, loading, error, fetchDocuments } = useDocuments();
  const [selectedDocId, setSelectedDocId] = useState('');

  useEffect(() => {
    fetchDocuments();
    const docIdParam = searchParams.get('docId');
    if (docIdParam) {
      setSelectedDocId(docIdParam);
    }
  }, [fetchDocuments, searchParams]);

  const activeDoc = documents.find(d => d._id === selectedDocId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Field Mapping Studio
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            Schema Bridge
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Associate detected AcroForm field keys with standard profile properties for one-click autofilling.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Select document bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-brand-500" />
            <span>Select PDF Form Template to Map</span>
          </label>
          {activeDoc && <PdfTypeDetector type={activeDoc.type} />}
        </div>
        
        {loading ? (
          <div className="py-2 flex justify-center">
            <Spinner size="sm" />
          </div>
        ) : (
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="glass-input block w-full max-w-xl rounded-2xl py-3 px-4 text-sm font-medium cursor-pointer"
          >
            <option value="">-- Choose a Form Template --</option>
            {documents
              .filter(d => d.fields && d.fields.length > 0)
              .map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.originalName} ({doc.fields.length} detected fields) {doc.hasXfa ? '[XFA]' : ''}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Mapper Canvas */}
      {activeDoc ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border space-y-6 shadow-xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {activeDoc.originalName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assign user profile variables to matching PDF AcroForm fields
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-500">
                {activeDoc.fields.length} detected field dictionary keys
              </span>
            </div>
          </div>

          <FieldMapper docId={activeDoc._id} fields={activeDoc.fields} />
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 border flex flex-col items-center justify-center min-h-[360px] text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 animate-float">
            <ArrowLeftRight className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
              No Template Selected
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Please choose an uploaded PDF template from the selector above to configure field bindings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMappingPage;

