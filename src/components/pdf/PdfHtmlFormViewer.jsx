import React, { useEffect, useState, useCallback } from 'react';
import documentApi from '../../services/document.api';
import PdfLoadingState from './PdfLoadingState';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';

const POLL_MS = 3000;

export const PdfHtmlFormViewer = ({ docId, pdfTitle }) => {
  const [status, setStatus] = useState('loading');
  const [htmlFormUrl, setHtmlFormUrl] = useState('');
  const [error, setError] = useState(null);
  const [formVuConfigured, setFormVuConfigured] = useState(true);
  const [converting, setConverting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await documentApi.getHtmlFormLink(docId);
      if (!res.data?.success) {
        setError(res.data?.message || 'Failed to load HTML form status.');
        setStatus('error');
        return;
      }

      const data = res.data.data;
      setFormVuConfigured(data.formVuConfigured !== false);

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
        setError('FormVu is not configured on the server.');
        setStatus('error');
        return;
      }

      setStatus('idle');
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

  const handleConvert = async () => {
    setConverting(true);
    setError(null);
    setStatus('converting');
    try {
      const res = await documentApi.convertToHtml(docId);
      if (res.data?.success) {
        setHtmlFormUrl(res.data.data.htmlFormUrl);
        setStatus('ready');
      } else {
        setError(res.data?.message || 'Conversion failed.');
        setStatus('error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'FormVu conversion failed.');
      setStatus('error');
    } finally {
      setConverting(false);
    }
  };

  if (status === 'loading') {
    return <PdfLoadingState />;
  }

  if (status === 'converting') {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 text-center">
        <Spinner size="md" />
        <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          Converting to interactive HTML…
        </h4>
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          FormVu is processing your XFA form (e.g. IMM 1295). This can take one to several minutes.
        </p>
      </div>
    );
  }

  if (status === 'error' || status === 'idle') {
    return (
      <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col items-center justify-center rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-600 dark:text-amber-400" />
        <h4 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
          Interactive HTML preview
        </h4>
        {pdfTitle && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{pdfTitle}</p>
        )}
        <p className="mb-4 max-w-lg text-sm text-slate-600 dark:text-slate-400">
          {formVuConfigured
            ? 'Convert this XFA PDF to a live HTML form you can fill in the browser (FormVu).'
            : 'Add FORMVU_CLOUD_TOKEN or FORMVU_SERVICE_URL to the backend .env to enable conversion.'}
        </p>
        {error && (
          <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {formVuConfigured && (
          <Button
            variant="primary"
            icon={converting ? undefined : RefreshCw}
            onClick={handleConvert}
            disabled={converting}
          >
            {converting ? 'Starting conversion…' : 'Convert to interactive HTML'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-12rem)] min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
      <p className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        Live HTML form (FormVu) — fill fields in your browser
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
