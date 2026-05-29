import React, { useEffect, useState, useCallback, useRef } from 'react';
import documentApi from '../../services/document.api';
import PdfLoadingState from './PdfLoadingState';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

const POLL_MS = 3000;

export const PdfHtmlFormViewer = ({ docId, pdfTitle, onReanalyze }) => {
  const [status, setStatus] = useState('loading');
  const [htmlFormUrl, setHtmlFormUrl] = useState('');
  const [error, setError] = useState(null);
  const [formVuConfigured, setFormVuConfigured] = useState(false);
  const [converting, setConverting] = useState(false);
  const autoConvertStarted = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await documentApi.getHtmlFormLink(docId);
      if (!res.data?.success) {
        setError(res.data?.message || 'Failed to load HTML form status.');
        setStatus('error');
        return;
      }

      const data = res.data.data;
      setFormVuConfigured(Boolean(data.formVuConfigured));

      if (data.htmlFormStatus === 'ready' && data.htmlFormUrl) {
        setHtmlFormUrl(data.htmlFormUrl);
        setStatus('ready');
        setError(null);
        return;
      }

      if (data.htmlFormStatus === 'failed') {
        setError(data.htmlFormError || 'HTML conversion failed.');
        setStatus('error');
        return;
      }

      if (['pending', 'converting'].includes(data.htmlFormStatus)) {
        setStatus('converting');
        setError(null);
        return;
      }

      if (!data.formVuConfigured) {
        setError(null);
        setStatus('needs_config');
        return;
      }

      setStatus('idle');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the API.');
      setStatus('error');
    }
  }, [docId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status !== 'converting') return undefined;
    const timer = setInterval(loadStatus, POLL_MS);
    return () => clearInterval(timer);
  }, [status, loadStatus]);

  const handleConvert = useCallback(async () => {
    setConverting(true);
    setError(null);
    setStatus('converting');
    try {
      const res = await documentApi.convertToHtml(docId);
      if (res.data?.success && res.data.data.htmlFormUrl) {
        setHtmlFormUrl(res.data.data.htmlFormUrl);
        setStatus('ready');
      } else {
        setError(res.data?.message || 'Conversion failed.');
        setStatus('error');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'FormVu conversion failed. Check FORMVU_CLOUD_TOKEN on the server.'
      );
      setStatus('error');
    } finally {
      setConverting(false);
    }
  }, [docId]);

  useEffect(() => {
    if (
      status === 'idle' &&
      formVuConfigured &&
      !autoConvertStarted.current &&
      !converting
    ) {
      autoConvertStarted.current = true;
      handleConvert();
    }
  }, [status, formVuConfigured, converting, handleConvert]);

  if (status === 'loading') {
    return <PdfLoadingState />;
  }

  if (status === 'converting') {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <Spinner size="md" />
        <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          Building interactive HTML form…
        </h4>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          Your XFA PDF cannot display in Adobe Embed (&quot;Please wait…&quot;). FormVu is
          converting it for live filling in the browser. This may take a few minutes.
        </p>
      </div>
    );
  }

  if (status === 'needs_config') {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/5 p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
          FormVu not configured on server
        </h4>
        <p className="mb-4 max-w-lg text-sm text-slate-600 dark:text-slate-400">
          IMM 1295 and other XFA forms <strong>cannot</strong> use Adobe PDF Embed — they always
          show &quot;Please wait…&quot;. Add this to your backend on Render, then redeploy:
        </p>
        <pre className="mb-4 rounded-lg bg-slate-900 px-4 py-3 text-left text-xs text-emerald-400">
          FORMVU_CLOUD_TOKEN=your_token{'\n'}
          BASE_URL=https://pdfpreview-backend.onrender.com
        </pre>
        <p className="text-xs text-slate-500">
          Free trial:{' '}
          <a
            href="https://www.idrsolutions.com/formvu/"
            className="text-brand-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            idrsolutions.com/formvu
          </a>
        </p>
        {onReanalyze && (
          <Button className="mt-4" variant="outline" onClick={onReanalyze}>
            Re-detect XFA metadata
          </Button>
        )}
      </div>
    );
  }

  if (status === 'error' || status === 'idle') {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-400" />
        <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
          XFA form — HTML preview required
        </h4>
        {pdfTitle && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{pdfTitle}</p>
        )}
        <p className="mb-4 max-w-lg text-sm text-slate-600 dark:text-slate-400">
          The PDF viewer cannot show this file (you would only see &quot;Please wait…&quot;).
          Convert it to an interactive HTML form instead.
        </p>
        {error && (
          <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="primary"
            icon={converting ? undefined : RefreshCw}
            onClick={handleConvert}
            disabled={converting}
          >
            {converting ? 'Converting…' : 'Convert to interactive HTML'}
          </Button>
          {onReanalyze && (
            <Button variant="outline" onClick={onReanalyze}>
              Re-analyze PDF
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-12rem)] min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
      <p className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        Live HTML form — fill in browser (not Adobe Embed)
      </p>
      <iframe
        title={pdfTitle || 'Interactive PDF form'}
        src={htmlFormUrl}
        className="w-full flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
};

export default PdfHtmlFormViewer;
