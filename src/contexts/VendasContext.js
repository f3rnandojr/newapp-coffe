// src/contexts/VendasContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const VendasContext = createContext();

export function VendasProvider({ children }) {
  const [vendas, setVendas] = useState([]);

  // Carregar vendas do localStorage
  useEffect(() => {
    const savedVendas = localStorage.getItem('cafeteria_vendas');
    if (savedVendas) {
      setVendas(JSON.parse(savedVendas));
    }
  }, []);

  // Salvar vendas no localStorage
  useEffect(() => {
    localStorage.setItem('cafeteria_vendas', JSON.stringify(vendas));
  }, [vendas]);

  const registrarVenda = (novaVenda) => {
    const vendaCompleta = {
      ...novaVenda,
      id: Date.now(), // ID único
      dataHora: new Date().toISOString()
    };
    
    setVendas(prevVendas => [...prevVendas, vendaCompleta]);
    return vendaCompleta;
  };

  const getVendasPorPeriodo = (dataInicio, dataFim) => {
    return vendas.filter(venda => {
      const dataVenda = new Date(venda.dataHora);
      return dataVenda >= dataInicio && dataVenda <= dataFim;
    });
  };

  return (
    <VendasContext.Provider value={{
      vendas,
      registrarVenda,
      getVendasPorPeriodo
    }}>
      {children}
    </VendasContext.Provider>
  );
}

// CORREÇÃO: Exporte como useVendas (não useVendas)
export function useVendas() {
  const context = useContext(VendasContext);
  if (!context) {
    throw new Error('useVendas must be used within a VendasProvider');
  }
  return context;
}

// Exporte também o contexto para testes ou uso avançado
export default VendasContext;