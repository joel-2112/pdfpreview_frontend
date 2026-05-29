import React from 'react';
import { AlertTriangle, Download, Sparkles } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

export const PdfXfaNotice = ({
  url,
  fileName,
  onPreparePreview,
  preparing = false,
  prepareError,
}) => (
  <div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-8 text-center">
    <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-400" />
    <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
      XFA form — Adobe Embed cannot show the raw file
    </h4>
    <p className="mb-4 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
      Your Adobe client ID works for normal AcroForm PDFs. XFA templates must be flattened on the
      server first, then the flattened copy is opened in the same Embed viewer.
    </p>
    {prepareError && (
      <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-400">{prepareError}</p>
    )}
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      {onPreparePreview && (
        <Button
          variant="primary"
          icon={preparing ? undefined : Sparkles}
          onClick={onPreparePreview}
          disabled={preparing}
        >
          {preparing ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Preparing preview…
            </span>
          ) : (
            'Prepare preview on server'
          )}
        </Button>
      )}
      {url && (
        <a href={url} download={fileName} className="no-underline">
          <Button variant="outline" icon={Download}>
            Download original
          </Button>
        </a>
      )}
    </div>
    <p className="mt-6 max-w-md text-xs text-slate-500 dark:text-slate-500">
      Requires <strong>pdftk</strong> on the backend (set <code className="text-[10px]">PDFTK_PATH</code>
      ). Dynamic XFA may still need AEM Forms or manual export from Acrobat.
    </p>
  </div>
);

export default PdfXfaNotice;
