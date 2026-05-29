import React, { createContext, useState, useContext } from 'react';

const PdfContext = createContext(null);

export const PdfProvider = ({ children }) => {
  const [currentDoc, setCurrentDoc] = useState(null);
  const [viewType, setViewType] = useState('original'); // 'original' or 'filled'
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectDocument = (doc, type = 'original') => {
    setCurrentDoc(doc);
    setViewType(type);
    setPage(1);
    setNumPages(0);
    setScale(1.0);
    setError(null);
  };

  const clearDocument = () => {
    setCurrentDoc(null);
    setPage(1);
    setNumPages(0);
    setError(null);
  };

  return (
    <PdfContext.Provider value={{
      currentDoc,
      viewType,
      page,
      numPages,
      scale,
      loading,
      error,
      setViewType,
      setPage,
      setNumPages,
      setScale,
      setLoading,
      setError,
      selectDocument,
      clearDocument
    }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error('usePdfContext must be used within a PdfProvider');
  }
  return context;
};
export default usePdfContext;
