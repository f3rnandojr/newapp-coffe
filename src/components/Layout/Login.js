// src/components/Layout/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login(username, password)) {
      alert('Usuário ou senha incorretos!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <i className="bi bi-cup-hot-fill" style={{fontSize: '2.5rem'}}></i>
          <h2 className="mt-2">Sistema Cafeterias</h2>
          <p className="text-muted">Faça login para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuário</label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              placeholder="Digite seu usuário" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="Digite sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Entrar</button>
          </div>
        </form>
        
        <div className="mt-3 text-center">
          <p className="text-muted">Use: admin / admin</p>
        </div>
      </div>
    </div>
  );
}

export default Login;