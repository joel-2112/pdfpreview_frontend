import React from 'react';
import DocumentCard from './DocumentCard';
import { Files } from 'lucide-react';

export const DocumentList = ({ documents, onView, onAutofill, onMapping, onDelete }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 mb-4 animate-bounce">
          <Files className="h-6.5 w-6.5" />
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No documents uploaded</h4>
        <p className="text-sm text-slate-600 dark:text-slate-500 max-w-sm">
          Please drag & drop your AcroForm or hybrid XFA PDF file above to parse and start filling form variables.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc._id}
          doc={doc}
          onView={onView}
          onAutofill={onAutofill}
          onMapping={() => onMapping(doc._id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DocumentList;