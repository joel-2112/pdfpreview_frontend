import React, { useRef } from 'react';
import { AlertTriangle, Download, Sparkles, Upload } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

export const PdfXfaNotice = ({
  url,
  fileName,
  pdfTitle,
  liveCycleXfa = false,
  hasManualPreview = false,
  onPreparePreview,
  onUploadPreview,
  onReanalyze,
  preparing = false,
  uploading = false,
  prepareError,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUploadPreview) {
      onUploadPreview(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-400" />
      <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
        {liveCycleXfa ? 'LiveCycle XFA form (e.g. IMM 1295)' : 'XFA form'} — cannot preview raw file
      </h4>

      {pdfTitle && (
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">{pdfTitle}</p>
      )}

      <p className="mb-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {liveCycleXfa ? (
          <>
            Your PDF was built with <strong>Adobe LiveCycle Designer</strong> (IRCC / IMM forms).
            The &quot;Please wait…&quot; page is normal in the browser — Adobe Embed and Chrome only
            show that shell, not the real form. To preview in this app, upload a{' '}
            <strong>flattened copy</strong> created in desktop Acrobat Reader.
          </>
        ) : (
          <>
            Adobe Embed works for normal PDFs but not XFA. Flatten the template first, then upload
            the preview copy below.
          </>
        )}
      </p>

      {liveCycleXfa && (
        <ol className="mb-6 max-w-md list-decimal space-y-2 text-left text-xs text-slate-600 dark:text-slate-400 pl-5">
          <li>Open the original PDF in <strong>Adobe Acrobat Reader</strong> (desktop).</li>
          <li>Wait until the full form appears (not &quot;Please wait&quot;).</li>
          <li>
            <strong>File → Print</strong> → choose <strong>Microsoft Print to PDF</strong> or{' '}
            <strong>Save as PDF</strong>.
          </li>
          <li>Upload that new PDF using the button below — then open Preview again.</li>
        </ol>
      )}

      {prepareError && (
        <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-400">{prepareError}</p>
      )}

      {hasManualPreview && (
        <p className="mb-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          A flattened preview is on file — close and reopen Preview to load it in Adobe Embed.
        </p>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row flex-wrap justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="primary"
          icon={uploading ? undefined : Upload}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Uploading preview…
            </span>
          ) : (
            'Upload flattened preview PDF'
          )}
        </Button>

        {!liveCycleXfa && onPreparePreview && (
          <Button
            variant="outline"
            icon={preparing ? undefined : Sparkles}
            onClick={onPreparePreview}
            disabled={preparing}
          >
            {preparing ? 'Preparing…' : 'Try server flatten (pdftk)'}
          </Button>
        )}

        {onReanalyze && (
          <Button variant="outline" onClick={onReanalyze}>
            Switch to HTML preview
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
    </div>
  );
};

export default PdfXfaNotice;
