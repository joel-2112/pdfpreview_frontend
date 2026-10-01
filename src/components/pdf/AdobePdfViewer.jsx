import React, { useEffect, useRef, useState } from 'react';
import { loadAdobeSDK } from '../../utils/adobeLoader';
import { ADOBE_CONFIG } from '../../constants/adobeConfig';
import PdfLoadingState from './PdfLoadingState';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';

export const AdobePdfViewer = ({
  fileUrl,
  fileName = 'document.pdf',
  pdfType = 'AcroForm',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerId = useRef(`adobe-dc-view-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;

    if (!fileUrl) return;

    setLoading(true);
    setError(null);

    loadAdobeSDK()
      .then((adobeDC) => {
        if (!isMounted) return;

        const clientId = import.meta.env.VITE_ADOBE_CLIENT_ID || ADOBE_CONFIG.CLIENT_ID;
        
        try {
          const adobeDCView = new adobeDC.View({
            clientId,
            divId: containerId.current,
          });

          adobeDCView.previewFile(
            {
              content: { location: { url: fileUrl } },
              metaData: { fileName },
            },
            {
              embedMode: 'SIZED_CONTAINER',
              showAnnotationTools: false,
              showLeftHandPanel: false,
              showPageControls: true,
              showDownloadPDF: true,
              showPrintPDF: true,
              enableFormFilling: true,
              dockPageControls: true,
            }
          ).then(() => {
            if (isMounted) setLoading(false);
          }).catch((err) => {
            if (isMounted) {
              console.warn('Adobe PDF Embed API preview error:', err);
              setError(err.message || 'Adobe PDF Embed API failed to render this document.');
              setLoading(false);
            }
          });
        } catch (initErr) {
          if (isMounted) {
            console.error('Adobe View initialization error:', initErr);
            setError('Failed to initialize Adobe PDF Embed API viewer.');
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Adobe SDK Load error:', err);
          setError('Failed to load Adobe PDF Embed SDK.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileUrl, fileName, pdfType]);

  if (error) {
    return (
      <div className="glass-panel flex min-h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 p-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
            Adobe PDF Embed API Notice
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {error}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
            Note: Dynamic XFA forms require flattening before Adobe Embed API preview.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {fileUrl && (
            <a href={fileUrl} download={fileName} className="inline-block">
              <Button variant="primary" size="sm" icon={Download}>
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col bg-white dark:bg-[#070c18] rounded-3xl overflow-hidden shadow-2xl">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-[#070c18]/80 backdrop-blur-sm">
          <PdfLoadingState />
        </div>
      )}
      <div
        id={containerId.current}
        className="w-full h-[calc(100vh-14rem)] min-h-[560px]"
      />
    </div>
  );
};

export default AdobePdfViewer;
