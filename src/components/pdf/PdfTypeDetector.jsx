import React from 'react';
import { getBadgeStyles } from '../../utils/pdfTypeHelper';

export const PdfTypeDetector = ({ type }) => {
  const styles = getBadgeStyles(type);
  
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase ${styles}`}>
      {type === 'flat' ? 'flat pdf' : type}
    </span>
  );
};

export default PdfTypeDetector;
