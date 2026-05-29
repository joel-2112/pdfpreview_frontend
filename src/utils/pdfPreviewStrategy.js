import { PDF_TYPES } from '../constants/pdfTypes';

export const isLiveCycleXfa = (doc) => {
  if (!doc) return false;
  if (doc.xfaEngine === 'livecycle') return true;
  const combined = [doc.pdfCreator, doc.pdfProducer].filter(Boolean).join(' ');
  return /LiveCycle/i.test(combined);
};

export const isXfaDocument = (doc) => {
  if (!doc) return false;
  if (doc.type === PDF_TYPES.XFA) return true;
  if (doc.hasXfa) return true;
  if (doc.xfaEngine === 'livecycle' || doc.xfaEngine === 'generic') return true;
  if (isLiveCycleXfa(doc)) return true;
  const title = doc.pdfTitle || '';
  if (/IMM\s*1295/i.test(title)) return true;
  return false;
};

/** @deprecated use isXfaDocument */
export const needsServerPreview = (doc) => isXfaDocument(doc);

export const hasManualPreview = (doc) => Boolean(doc?.previewPath);

/** XFA / LiveCycle → interactive HTML (FormVu), never Adobe Embed */
export const shouldUseHtmlFormViewer = (doc, options = {}) => {
  if (options.forceHtml) return true;
  return isXfaDocument(doc);
};

export const isHtmlFormReady = (doc) => doc?.htmlFormStatus === 'ready';

export const canUseAdobeEmbed = (doc, usingFlattenedPreview = false) => {
  if (usingFlattenedPreview) return true;
  return !isXfaDocument(doc);
};

export const getSecureLinkType = (doc, viewType = 'original') => {
  if (viewType === 'filled') return 'filled';
  if (isXfaDocument(doc)) return 'preview';
  return 'original';
};

export const getEffectivePdfTypeForViewer = (doc, usingFlattenedPreview = false) => {
  if (usingFlattenedPreview) return PDF_TYPES.FLAT;
  return doc?.type || PDF_TYPES.ACROFORM;
};

/** Detect IMM 1295 / IRCC "Please wait" shell in streamed PDF bytes */
export const isXfaPlaceholderBuffer = (buffer) => {
  try {
    const sample = new TextDecoder('latin1').decode(
      buffer.slice(0, Math.min(buffer.byteLength, 2 * 1024 * 1024))
    );
    return (
      sample.includes('Please wait') &&
      (sample.includes('not eventually replaced') ||
        sample.includes('Adobe Reader') ||
        sample.includes('reader_download'))
    );
  } catch {
    return false;
  }
};
