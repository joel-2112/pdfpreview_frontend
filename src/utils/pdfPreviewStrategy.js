import { PDF_TYPES } from '../constants/pdfTypes';

/** Adobe PDF Embed API cannot render XFA — only flattened or AcroForm PDFs. */
export const needsServerPreview = (doc) => {
  if (!doc) return false;
  const fieldCount = doc.fields?.length ?? 0;
  if (doc.type === PDF_TYPES.XFA) return true;
  if (doc.hasXfa && fieldCount === 0) return true;
  return false;
};

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
