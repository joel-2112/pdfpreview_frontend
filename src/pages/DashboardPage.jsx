import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import { FileText, ArrowRight, UploadCloud, Database, Settings } from 'lucide-react';
import Spinner from '../components/shared/Spinner';
import Button from '../components/shared/Button';

export const DashboardPage = () => {
  const { documents, loading, fetchDocuments } = useDocuments();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Compute stats
  const totalCount = documents.length;
  const acroFormCount = documents.filter(d => d.type === 'AcroForm').length;
  const xfaCount = documents.filter(d => d.type === 'XFA').length;
  const flatCount = documents.filter(d => d.type === 'flat').length;

  return (
    <div className="space-y-8 animate-fade-in bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Monitor uploaded templates, field mappings, and trigger PDF autofill services.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total PDFs', val: totalCount, color: 'text-brand-600 dark:text-brand-400' },
          { label: 'Standard AcroForms', val: acroFormCount, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'XFA Templates', val: xfaCount, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Flat Documents', val: flatCount, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</span>
            <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${stat.color}`}>{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Quick Upload Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <UploadCloud className="h-5.5 w-5.5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Upload new PDF template</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload your form template. The server will dynamically analyze and map all form layout fields.
            </p>
          </div>
          <Link to="/documents">
            <Button variant="primary" size="md" className="w-full" icon={ArrowRight}>
              Go to Upload
            </Button>
          </Link>
        </div>

        {/* Recently Uploaded */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recently Processed Templates</h4>
              <Link to="/documents" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center space-x-1.5 transition-colors">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center text-slate-500 text-sm">
                <span>No documents processed. Upload a file to get started.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-850 max-h-[220px] overflow-y-auto pr-2">
                {documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => navigate('/documents')}
                    className="flex items-center justify-between py-3.5 hover:bg-slate-900/10 cursor-pointer rounded-xl px-3 transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-850 text-slate-400">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200 truncate">{doc.originalName}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-850 border border-slate-800 rounded">
                      {doc.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
