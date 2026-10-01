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
      return 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/30';
    case PDF_TYPES.XFA:
      return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30';
    case PDF_TYPES.FLAT:
      return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
};

