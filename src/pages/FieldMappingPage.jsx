import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import FieldMapper from '../components/autofill/FieldMapper';
import Spinner from '../components/shared/Spinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ArrowLeftRight, HelpCircle } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          PDF Field Mapping Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Map PDF AcroForm fields to user variables for seamless autofilling.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Select document bar */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Document template to Map
        </label>
        
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="block w-full max-w-xl rounded-xl border border-slate-800 bg-slate-950/40 py-3 px-4 text-sm text-slate-300 outline-none focus:border-brand-500 focus:bg-slate-950/60 transition-all duration-200"
          >
            <option value="">-- Choose Template --</option>
            {documents
              .filter(d => d.fields && d.fields.length > 0)
              .map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.originalName} ({doc.fields.length} detected fields)
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Mapper Canvas */}
      {activeDoc ? (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3.5">
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">{activeDoc.originalName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Assign which user variables populate which AcroForm tags</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/25 px-2.5 py-0.5 rounded-md">
              {activeDoc.type}
            </span>
          </div>

          <FieldMapper docId={activeDoc._id} fields={activeDoc.fields} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 border border-slate-850 bg-slate-950/20 rounded-2xl p-6 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-600">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-400">Mapping interface canvas</h4>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Please choose a parsed template PDF from the selector dropdown above to associate layout inputs.
          </p>
        </div>
      )}
    </div>
  );
};

export default FieldMappingPage;
