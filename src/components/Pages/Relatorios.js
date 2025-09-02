// src/components/Pages/Relatorios.js
import React, { useState } from 'react';

function Relatorios() {
  const [filtro, setFiltro] = useState({
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    cafeteria: '',
    tipoRelatorio: 'vendas'
  });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({ ...prev, [name]: value }));
  };

  const gerarRelatorio = () => {
    // Lógica para gerar relatório baseado nos filtros
    alert(`Gerando relatório de ${filtro.tipoRelatorio} para o período ${filtro.dataInicio} a ${filtro.dataFim}`);
  };

  return (
    <div>
      <div className="simple-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Relatórios do Sistema</h5>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title">Filtros do Relatório</h6>
          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Tipo de Relatório</label>
                <select 
                  className="form-select" 
                  name="tipoRelatorio"
                  value={filtro.tipoRelatorio}
                  onChange={handleFiltroChange}
                >
                  <option value="vendas">Vendas</option>
                  <option value="produtos">Produtos Mais Vendidos</option>
                  <option value="colaboradores">Consumo por Colaborador</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Data Início</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="dataInicio"
                  value={filtro.dataInicio}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Data Fim</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="dataFim"
                  value={filtro.dataFim}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Cafeteria</label>
                <select 
                  className="form-select" 
                  name="cafeteria"
                  value={filtro.cafeteria}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todas</option>
                  <option value="1">Cafeteria 1</option>
                  <option value="2">Cafeteria 2</option>
                </select>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={gerarRelatorio}>
            <i className="bi bi-file-earmark-text me-1"></i> Gerar Relatório
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h6 className="card-title">Relatórios Disponíveis</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-cash-coin" style={{fontSize: '2rem'}}></i>
                  <h6 className="card-title mt-2">Relatório de Vendas</h6>
                  <p className="card-text">Relatório detalhado de vendas por período, forma de pagamento e cafeteria.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-cup-straw" style={{fontSize: '2rem'}}></i>
                  <h6 className="card-title mt-2">Produtos Mais Vendidos</h6>
                  <p className="card-text">Ranking dos produtos mais vendidos por período e cafeteria.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-people" style={{fontSize: '2rem'}}></i>
                  <h6 className="card-title mt-2">Consumo por Colaborador</h6>
                  <p className="card-text">Relatório de consumo individual por colaborador e departamento.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;