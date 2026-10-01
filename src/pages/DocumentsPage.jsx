import React, { useEffect, useState, useMemo } from 'react';
import useDocuments from '../hooks/useDocuments';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import PdfModal from '../components/pdf/PdfModal';
import Spinner from '../components/shared/Spinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Search, LayoutGrid, List, RefreshCw, UploadCloud, Filter } from 'lucide-react';
import Button from '../components/shared/Button';

export const DocumentsPage = () => {
  const { documents, loading, error, fetchDocuments, deleteDocument } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewType, setViewType] = useState('original');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, AcroForm, XFA, flat
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showUpload, setShowUpload] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleView = (doc, type = 'original') => {
    setSelectedDoc(doc);
    setViewType(type);
    setModalOpen(true);
  };

  const handleAutofill = (doc) => {
    navigate('/autofill', { state: { selectedDocId: doc._id } });
  };

  const handleMapping = (docId) => {
    navigate(`/field-mappings?docId=${docId}`);
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = (doc.originalName || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'XFA') return doc.type === 'XFA' || doc.hasXfa;
      return doc.type === activeFilter;
    });
  }, [documents, searchQuery, activeFilter]);

  const counts = {
    all: documents.length,
    acro: documents.filter(d => d.type === 'AcroForm').length,
    xfa: documents.filter(d => d.type === 'XFA' || d.hasXfa).length,
    flat: documents.filter(d => d.type === 'flat').length,
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Template Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {documents.length} Files
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ingest, inspect schemas, and manage your dynamic PDF templates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDocuments}
            icon={RefreshCw}
            title="Refresh documents"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowUpload(!showUpload)}
            icon={UploadCloud}
          >
            {showUpload ? 'Hide Uploader' : 'Upload File'}
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Upload Zone */}
      {showUpload && (
        <div className="glass-panel rounded-3xl p-6 border shadow-lg space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <UploadCloud className="h-4 w-4 text-brand-500" />
              <span>PDF Ingestion & Form Parser</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Accepts: .pdf (up to 50MB)</span>
          </div>
          <DocumentUpload onUploadSuccess={fetchDocuments} />
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by filename..."
            className="glass-input block w-full rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Templates', count: counts.all },
            { id: 'AcroForm', label: 'AcroForm', count: counts.acro },
            { id: 'XFA', label: 'XFA Forms', count: counts.xfa },
            { id: 'flat', label: 'Flat PDFs', count: counts.flat },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / List */}
      <div className="space-y-4">
        {loading && documents.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <DocumentList
            documents={filteredDocuments}
            onView={handleView}
            onAutofill={handleAutofill}
            onMapping={handleMapping}
            onDelete={deleteDocument}
          />
        )}
      </div>

      {/* PDF View Modal */}
      {selectedDoc && (
        <PdfModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          docId={selectedDoc._id}
          viewType={viewType}
          fileName={selectedDoc.originalName}
          pdfType={selectedDoc.type}
          hasXfa={Boolean(selectedDoc.hasXfa)}
        />
      )}
    </div>
  );
};

export default DocumentsPage;

