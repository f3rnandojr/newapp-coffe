// src/components/Layout/Navigation.js
import React from 'react';

function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'vendas', icon: 'bi-cash-coin', label: 'Vendas' },
    { id: 'historico', icon: 'bi-clock-history', label: 'Histórico' },
    { id: 'produtos', icon: 'bi-cup-straw', label: 'Produtos' },
    { id: 'movimentacoes', icon: 'bi-arrow-left-right', label: 'Movimentações' },
    { id: 'colaboradores', icon: 'bi-people', label: 'Colaboradores' },
    { id: 'contas', icon: 'bi-receipt', label: 'Contas a Receber' },
    { id: 'relatorios', icon: 'bi-graph-up', label: 'Relatórios' }
  ];

  return (
    <div className="col-md-2 d-none d-md-block bg-light sidebar">
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {navItems.map(item => (
            <li className="nav-item" key={item.id}>
              <button 
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Navigation;