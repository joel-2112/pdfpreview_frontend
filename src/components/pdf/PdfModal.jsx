import React from 'react';
import Modal from '../shared/Modal';
import PdfViewer from './PdfViewer';

export const PdfModal = ({ isOpen, onClose, docId, viewType = 'original', fileName }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`PDF Previewer - ${viewType === 'filled' ? 'Autofilled Form' : 'Original Template'}`}
      size="xl"
    >
      <div className="w-full">
        {isOpen && docId && (
          <PdfViewer docId={docId} viewType={viewType} fileName={fileName} />
        )}
      </div>
    </Modal>
  );
};

export default PdfModal;
