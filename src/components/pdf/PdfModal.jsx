import React from 'react';
import Modal from '../shared/Modal';
import PdfViewer from './PdfViewer';

export const PdfModal = ({
  isOpen,
  onClose,
  docId,
  viewType = 'original',
  fileName,
  pdfType,
  hasXfa,
}) => {
  const isFilled = viewType === 'filled';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName || 'PDF Document Viewer'}
      subtitle={`${isFilled ? 'Autofilled Output Stream' : 'Raw Document Template'} • ${pdfType || 'AcroForm'}`}
      size="full"
    >
      <div className="w-full h-full">
        {isOpen && docId && (
          <PdfViewer
            docId={docId}
            viewType={viewType}
            fileName={fileName}
            pdfType={pdfType}
            hasXfa={hasXfa}
          />
        )}
      </div>
    </Modal>
  );
};

export default PdfModal;

