// src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CafeteriaProvider, useCafeteria } from './contexts/CafeteriaContext';
import { VendasProvider } from './contexts/VendasContext'; // ← Adicione esta importação
import Login from './components/Layout/Login';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Vendas from './components/Pages/Vendas';
import Historico from './components/Pages/Historico';
import Produtos from './components/Pages/Produtos';
import Movimentacoes from './components/Pages/Movimentacoes';
import Colaboradores from './components/Pages/Colaboradores';
import ContasReceber from './components/Pages/ContasReceber';
import Relatorios from './components/Pages/Relatorios';
import './App.css';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { currentPage, setCurrentPage } = useCafeteria();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'vendas': return <Vendas />;
      case 'historico': return <Historico />;
      case 'produtos': return <Produtos />;
      case 'movimentacoes': return <Movimentacoes />;
      case 'colaboradores': return <Colaboradores />;
      case 'contas': return <ContasReceber />;
      case 'relatorios': return <Relatorios />;
      default: return <Vendas />;
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="container-fluid">
        <div className="row">
          <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main className="col-md-10 ms-sm-auto px-4">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CafeteriaProvider>
        <VendasProvider> {/* ← Adicione este provider */}
          <MainApp />
        </VendasProvider>
      </CafeteriaProvider>
    </AuthProvider>
  );
}

export default App;