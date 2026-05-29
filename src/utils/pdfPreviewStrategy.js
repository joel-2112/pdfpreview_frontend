import { PDF_TYPES } from '../constants/pdfTypes';

export const isLiveCycleXfa = (doc) => {
  if (!doc) return false;
  if (doc.xfaEngine === 'livecycle') return true;
  const combined = [doc.pdfCreator, doc.pdfProducer].filter(Boolean).join(' ');
  return /LiveCycle/i.test(combined);
};

/** Adobe PDF Embed API cannot render XFA — only flattened or AcroForm PDFs. */
export const needsServerPreview = (doc) => {
  if (!doc) return false;
  const fieldCount = doc.fields?.length ?? 0;
  if (doc.type === PDF_TYPES.XFA) return true;
  if (doc.hasXfa && fieldCount === 0) return true;
  return false;
};

export const hasManualPreview = (doc) => Boolean(doc?.previewPath);

export const shouldUseHtmlFormViewer = (doc) => {
  if (!doc) return false;
  return needsServerPreview(doc);
};

export const isHtmlFormReady = (doc) => doc?.htmlFormStatus === 'ready';

export const canUseAdobeEmbed = (doc, usingFlattenedPreview = false) => {
  if (usingFlattenedPreview) return true;
  return !needsServerPreview(doc);
};

export const getSecureLinkType = (doc, viewType = 'original') => {
  if (viewType === 'filled') return 'filled';
  if (needsServerPreview(doc)) return 'preview';
  return 'original';
};

export const getEffectivePdfTypeForViewer = (doc, usingFlattenedPreview = false) => {
  if (usingFlattenedPreview) return PDF_TYPES.FLAT;
  return doc?.type || PDF_TYPES.ACROFORM;
};

/** Detect IMM 1295 / IRCC "Please wait" shell in streamed PDF bytes. */
export const isXfaPlaceholderBuffer = (buffer) => {
  try {
    const sample = new TextDecoder('latin1').decode(
      buffer.slice(0, Math.min(buffer.byteLength, 2 * 1024 * 1024))
    );
    return (
      sample.includes('Please wait') &&
      sample.includes('not eventually replaced by the proper contents')
    );
  } catch {
    return false;
  }
};
