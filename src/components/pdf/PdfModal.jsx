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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`PDF Previewer — Adobe Embed · ${viewType === 'filled' ? 'Autofilled' : 'Template'}`}
      size="xl"
    >
      <div className="w-full">
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
