import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocuments from '../hooks/useDocuments';
import useAuth from '../hooks/useAuth';
import { FileText, ArrowRight, UploadCloud, Database, FileSpreadsheet, Sparkles, Layers, ShieldCheck, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import Spinner from '../components/shared/Spinner';
import Button from '../components/shared/Button';
import PdfTypeDetector from '../components/pdf/PdfTypeDetector';

export const DashboardPage = () => {
  const { documents, loading, fetchDocuments } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Compute stats
  const totalCount = documents.length;
  const acroFormCount = documents.filter(d => d.type === 'AcroForm').length;
  const xfaCount = documents.filter(d => d.type === 'XFA' || d.hasXfa).length;
  const flatCount = documents.filter(d => d.type === 'flat').length;
  const totalFields = documents.reduce((acc, doc) => acc + (doc.fields?.length || 0), 0);

  const stats = [
    {
      label: 'Total Templates',
      val: totalCount,
      desc: `${totalFields} parsed layout fields`,
      icon: FileText,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-500/10',
      border: 'border-brand-200/80 dark:border-brand-500/20',
    },
    {
      label: 'AcroForms Ready',
      val: acroFormCount,
      desc: 'Instant browser autofill',
      icon: CheckCircle2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-200/80 dark:border-indigo-500/20',
    },
    {
      label: 'XFA Templates',
      val: xfaCount,
      desc: 'Protected dynamic structures',
      icon: Layers,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-200/80 dark:border-amber-500/20',
    },
    {
      label: 'Flat Documents',
      val: flatCount,
      desc: 'Static read-only records',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-200/80 dark:border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-gradient-to-r from-white via-brand-50/30 to-indigo-50/40 dark:from-[#0c1324] dark:via-[#0e162a] dark:to-[#111c38] p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold">
              <span>Smart PDF Form Automation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Explorer'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload PDF documents, map schema variables to AcroForm keys, and stream populated files seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/documents">
              <Button variant="primary" size="md" icon={UploadCloud}>
                Upload Template
              </Button>
            </Link>
            <Link to="/autofill">
              <Button variant="outline" size="md" icon={Database}>
                Run Autofill
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="pointer-events-none absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 sm:p-6 border flex flex-col justify-between hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className={`text-3xl sm:text-4xl font-display font-black tracking-tight ${stat.color}`}>
                  {stat.val}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Quick Workflow Actions & Highlights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border space-y-5">
            <div className="space-y-1.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight pt-2">
                Quick Template Ingestion
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add government, enterprise, or standard PDF files. FillEngine automatically detects AcroForm tags and XFA schemas.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span>AcroForm Detection</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">100% Native</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>XFA FormVu Bridge</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">Supported</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Profile Variable Mapping</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">Active</span>
              </div>
            </div>

            <Link to="/documents" className="block pt-2">
              <Button variant="gradient" size="md" className="w-full" icon={ArrowRight} iconPosition="right">
                Manage Documents
              </Button>
            </Link>
          </div>

          {/* Quick Mapping Link Card */}
          <div className="glass-panel rounded-3xl p-6 border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Field Mapping Workspace
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Map custom user variables to detected PDF fields.
              </p>
            </div>
            <Link to="/field-mappings">
              <Button size="sm" variant="secondary" icon={FileSpreadsheet}>
                Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Documents Feed */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-7 border space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Recent PDF Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recently ingested files and layout states
              </p>
            </div>

            <Link
              to="/documents"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              <span>View Full Library</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No documents found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Get started by uploading your first PDF form template to begin autofilling.
              </p>
              <Link to="/documents">
                <Button size="sm" variant="primary" icon={UploadCloud}>
                  Upload First File
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 dark:divide-white/[0.06]">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => navigate('/documents')}
                  className="flex items-center justify-between py-4 px-3 rounded-2xl hover:bg-slate-100/70 dark:hover:bg-slate-850/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 truncate">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {doc.originalName}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono text-[11px]">{doc.fields?.length || 0} fields detected</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <PdfTypeDetector type={doc.type} />
                    <Eye className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

