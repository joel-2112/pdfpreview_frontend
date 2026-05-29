import React from 'react';
import { FileText, Eye, Database, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';
import PdfTypeDetector from '../pdf/PdfTypeDetector';
import Button from '../shared/Button';
import { needsServerPreview, isLiveCycleXfa } from '../../utils/pdfPreviewStrategy';

export const DocumentCard = ({ doc, onView, onAutofill, onMapping, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isXfaTemplate = needsServerPreview(doc);
  const liveCycle = isLiveCycleXfa(doc);
  const previewAttached = Boolean(doc.previewPath);

  return (
    <div className="relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-brand-500/30 dark:hover:border-brand-500/30 hover:shadow-lg dark:hover:bg-slate-900/50 transition-all duration-300 shadow-sm dark:shadow-xl group hover:scale-[1.01]">
      <div className="space-y-4">
        {/* Top Info */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 text-brand-600 dark:text-brand-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-all">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <PdfTypeDetector type={doc.type} />
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate" title={doc.originalName}>
            {doc.originalName}
          </h4>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </span>
            <span>•</span>
            <span>{formatSize(doc.size)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 px-4 py-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span>Detected Fields</span>
          <span className="font-bold text-slate-900 dark:text-white">{doc.fields?.length || 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-850">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(doc, 'original')}
          icon={Eye}
          title={
            liveCycle
              ? previewAttached
                ? 'Preview flattened copy in Adobe Embed'
                : 'Upload flattened PDF from Acrobat Print-to-PDF first'
              : isXfaTemplate
                ? 'XFA — flatten or upload preview PDF'
                : 'Preview in Adobe Embed'
          }
          className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {liveCycle
            ? previewAttached
              ? 'Preview'
              : 'Preview (needs flat PDF)'
            : isXfaTemplate
              ? 'Preview (XFA)'
              : 'Preview'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onMapping}
          icon={FileSpreadsheet}
          className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500/50 dark:hover:border-brand-500/20 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5"
        >
          Mappings
        </Button>
        
        <Button
          size="sm"
          variant="primary"
          onClick={onAutofill}
          icon={Database}
          className="col-span-2 text-xs bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-700 text-white shadow-sm dark:shadow-none"
          disabled={!doc.fields || doc.fields.length === 0}
        >
          Autofill Profile
        </Button>

        <button
          onClick={() => onDelete(doc._id)}
          className="col-span-2 mt-2 flex items-center justify-center space-x-1 py-2 text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-500/5 border border-transparent hover:border-red-200 dark:hover:border-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Document</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;