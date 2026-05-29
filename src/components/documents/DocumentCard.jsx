import React from 'react';
import { FileText, Eye, Database, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';
import PdfTypeDetector from '../pdf/PdfTypeDetector';
import Button from '../shared/Button';

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

  return (
    <div className="relative flex flex-col justify-between p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-brand-500/30 hover:bg-slate-900/50 transition-all duration-300 shadow-xl group hover:scale-[1.01]">
      <div className="space-y-4">
        {/* Top Info */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-850 text-brand-400 group-hover:bg-brand-500/10 group-hover:text-brand-300 transition-all">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <PdfTypeDetector type={doc.type} />
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight truncate" title={doc.originalName}>
            {doc.originalName}
          </h4>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </span>
            <span>•</span>
            <span>{formatSize(doc.size)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/40 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Detected Fields</span>
          <span className="font-bold text-white">{doc.fields?.length || 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-slate-850">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onView(doc, 'original')}
          icon={Eye}
          className="text-xs"
        >
          Preview
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onMapping}
          icon={FileSpreadsheet}
          className="text-xs hover:text-brand-400 hover:border-brand-500/20"
        >
          Mappings
        </Button>
        
        <Button
          size="sm"
          variant="primary"
          onClick={onAutofill}
          icon={Database}
          className="col-span-2 text-xs"
          disabled={!doc.fields || doc.fields.length === 0}
        >
          Autofill Profile
        </Button>

        <button
          onClick={() => onDelete(doc._id)}
          className="col-span-2 mt-2 flex items-center justify-center space-x-1 py-2 text-xs font-semibold text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Document</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
