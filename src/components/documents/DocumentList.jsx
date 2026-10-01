import React from 'react';
import DocumentCard from './DocumentCard';
import { Files, SearchX } from 'lucide-react';

export const DocumentList = ({ documents, onView, onAutofill, onMapping, onDelete }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-slate-200/90 dark:border-white/[0.08] space-y-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <SearchX className="h-7 w-7" />
        </div>
        <h4 className="text-base font-display font-bold text-slate-900 dark:text-white">
          No matching templates found
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Try clearing your filter criteria, searching for a different keyword, or drag & drop a new PDF file above to parse form keys.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc._id}
          doc={doc}
          onView={onView}
          onAutofill={() => onAutofill(doc)}
          onMapping={() => onMapping(doc._id)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DocumentList;