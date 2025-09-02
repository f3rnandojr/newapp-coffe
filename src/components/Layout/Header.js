// src/components/Layout/Header.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCafeteria } from '../../contexts/CafeteriaContext';

function Header() {
  const { currentUser, logout } = useAuth();
  const { currentCafe, changeCafe } = useCafeteria();

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      logout();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand ms-3" href="#">
          <i className="bi bi-cup-hot-fill me-2"></i>
          Sistema Cafeterias
        </a>
        <div className="d-flex align-items-center">
          <div className="dropdown me-3">
            <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="cafeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-shop me-1"></i>
              <span id="currentCafe">{currentCafe}</span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="cafeDropdown">
              <li><a className="dropdown-item" href="#" onClick={() => changeCafe('Cafeteria 1')}>Cafeteria 1</a></li>
              <li><a className="dropdown-item" href="#" onClick={() => changeCafe('Cafeteria 2')}>Cafeteria 2</a></li>
            </ul>
          </div>
          <span className="navbar-text me-3">Olá, <span id="current-user">{currentUser}</span></span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Header;