import React, { useEffect, useState } from 'react';
import useDocuments from '../hooks/useDocuments';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import PdfModal from '../components/pdf/PdfModal';
import Spinner from '../components/shared/Spinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import { useNavigate } from 'react-router-dom';

export const DocumentsPage = () => {
  const { documents, loading, error, fetchDocuments, deleteDocument } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewType, setViewType] = useState('original');
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Document Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload new templates and execute secure profile form injections.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Upload Zone */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
          Upload PDF File
        </h4>
        <DocumentUpload onUploadSuccess={fetchDocuments} />
      </div>

      {/* List Grid */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Your Processed Templates
        </h4>

        {loading && documents.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onView={handleView}
            onAutofill={handleAutofill}
            onMapping={handleMapping}
            onDelete={deleteDocument}
          />
        )}
      </div>

      {/* PDF View Modal Overlay */}
      {selectedDoc && (
        <PdfModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          docId={selectedDoc._id}
          viewType={viewType}
          fileName={selectedDoc.originalName}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
