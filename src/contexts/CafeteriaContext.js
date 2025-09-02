// src/contexts/CafeteriaContext.js
import React, { createContext, useContext, useState } from 'react';

const CafeteriaContext = createContext();

export function CafeteriaProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('vendas');

  return (
    <CafeteriaContext.Provider value={{
      currentPage,
      setCurrentPage // ← ISSO É CRÍTICO!
    }}>
      {children}
    </CafeteriaContext.Provider>
  );
}

export function useCafeteria() {
  const context = useContext(CafeteriaContext);
  if (!context) {
    throw new Error('useCafeteria must be used within a CafeteriaProvider');
  }
  return context; // ← Deve retornar { currentPage, setCurrentPage }
}