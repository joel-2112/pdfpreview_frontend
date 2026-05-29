export const ADOBE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_ADOBE_CLIENT_ID || '5b7a1122e83141fca4e195cd456789ff',
  EMBED_MODE: 'SIZED_CONTAINER', // SIZED_CONTAINER, FULL_WINDOW, IN_LINE
};

/** Adobe PDF Embed API supports AcroForm only — not XFA. */
export const getAdobeViewSettings = (pdfType) => ({
  showAnnotationTools: false,
  showLeftHandPanel: false,
  showPageControls: true,
  showDownloadPDF: true,
  showPrintPDF: true,
  enableFormFilling: pdfType === 'AcroForm',
});

export const ADOBE_SDK_URL = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
