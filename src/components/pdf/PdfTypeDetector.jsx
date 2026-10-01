import React from 'react';
import { getBadgeStyles } from '../../utils/pdfTypeHelper';

export const PdfTypeDetector = ({ type }) => {
  const styles = getBadgeStyles(type);
  const displayType = type === 'flat' ? 'Flat PDF' : type;

  const dotColors = {
    AcroForm: 'bg-indigo-500',
    XFA: 'bg-amber-500',
    flat: 'bg-emerald-500',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold tracking-wider uppercase border ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[type] || 'bg-slate-400'}`} />
      <span>{displayType}</span>
    </span>
  );
};

export default PdfTypeDetector;

