import { PDF_TYPES } from '../constants/pdfTypes';

export const isXfaPdf = (type) => {
  return type === PDF_TYPES.XFA;
};

export const isAcroForm = (type) => {
  return type === PDF_TYPES.ACROFORM;
};

export const isFlatPdf = (type) => {
  return type === PDF_TYPES.FLAT;
};

export const getBadgeStyles = (type) => {
  switch (type) {
    case PDF_TYPES.ACROFORM:
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    case PDF_TYPES.XFA:
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
    case PDF_TYPES.FLAT:
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
  }
};
