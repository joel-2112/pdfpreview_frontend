import React, { useState } from 'react';
import { FileText, Eye, Database, Trash2, Calendar, FileSpreadsheet, HardDrive, Hash, Check, X, ShieldAlert } from 'lucide-react';
import PdfTypeDetector from '../pdf/PdfTypeDetector';
import Button from '../shared/Button';
import { needsServerPreview, isLiveCycleXfa } from '../../utils/pdfPreviewStrategy';

export const DocumentCard = ({ doc, onView, onAutofill, onMapping, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isXfaTemplate = needsServerPreview(doc);
  const liveCycle = isLiveCycleXfa(doc);
  const fieldCount = doc.fields?.length || 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(doc._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="glass-card relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] hover:border-brand-500/40 dark:hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-0.5">
      
      <div className="space-y-4">
        {/* Card Header: Icon & Type badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-indigo-500/10 dark:from-brand-500/20 dark:to-indigo-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-xs group-hover:scale-105 transition-transform">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <PdfTypeDetector type={doc.type} />
        </div>

        {/* Title & Metadata */}
        <div>
          <h4
            className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
            title={doc.originalName}
          >
            {doc.originalName}
          </h4>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 font-mono text-[11px]">
              <HardDrive className="h-3 w-3" />
              <span>{formatSize(doc.size)}</span>
            </span>
          </div>
        </div>

        {/* Form Fields Status Pill */}
        <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-slate-900/50 px-3.5 py-2 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
            <Hash className="h-3.5 w-3.5 text-brand-500" />
            <span>Detected Form Fields</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {fieldCount}
          </span>
        </div>

        {isXfaTemplate && (
          <div className="flex items-center space-x-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-500/20">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Dynamic XFA • FormVu Stream</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(doc, 'original')}
            icon={Eye}
            className="w-full text-xs"
          >
            Preview
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onMapping}
            icon={FileSpreadsheet}
            className="w-full text-xs"
          >
            Mappings
          </Button>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={onAutofill}
          icon={Database}
          className="w-full text-xs py-2"
          disabled={!doc.fields || doc.fields.length === 0}
        >
          Autofill Profile Data
        </Button>

        {/* Delete button or confirmation state */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Document</span>
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs animate-fade-in">
            <span className="font-semibold text-rose-700 dark:text-rose-300 text-[11px]">Confirm delete?</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold text-[11px] shadow-xs cursor-pointer"
              >
                {deleting ? '...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;