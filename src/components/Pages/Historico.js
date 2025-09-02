// src/components/Pages/Historico.js
import React, { useState, useEffect } from 'react';
import { useVendas } from '../../contexts/VendasContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCafeteria } from '../../contexts/CafeteriaContext';

const Historico = () => {
  const { vendas } = useVendas();
  const { user } = useAuth();
  const { currentCafeteria, cafeterias } = useCafeteria();
  
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [cafeteriaFiltro, setCafeteriaFiltro] = useState('Todas');
  const [usuarioFiltro, setUsuarioFiltro] = useState('Todos');
  const [vendasFiltradas, setVendasFiltradas] = useState([]);

  // Obter lista única de usuários e cafeterias
  const usuariosUnicos = ['Todos', ...new Set(vendas.map(venda => venda.usuario))];
  const cafeteriasUnicas = ['Todas', ...new Set(vendas.map(venda => venda.cafeteria))];

  useEffect(() => {
    filtrarVendas();
  }, [vendas, dataInicio, dataFim, cafeteriaFiltro, usuarioFiltro]);

  const filtrarVendas = () => {
    let filtered = vendas;

    // Filtrar por data
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999); // Final do dia

      filtered = filtered.filter(venda => {
        const dataVenda = new Date(venda.dataHora);
        return dataVenda >= inicio && dataVenda <= fim;
      });
    }

    // Filtrar por cafeteria
    if (cafeteriaFiltro !== 'Todas') {
      filtered = filtered.filter(venda => venda.cafeteria === cafeteriaFiltro);
    }

    // Filtrar por usuário
    if (usuarioFiltro !== 'Todos') {
      filtered = filtered.filter(venda => venda.usuario === usuarioFiltro);
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    
    setVendasFiltradas(filtered);
  };

  const formatarDataHora = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const getItensFormatados = (itens) => {
    return itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
  };

  const getColaboradorInfo = (venda) => {
    if (venda.colaborador) {
      return `Colaborador: ${venda.colaborador}`;
    }
    return '';
  };

  const exportarCSV = () => {
    const csvContent = [
      ['ID', 'Data/Hora', 'Cafeteria', 'Usuário', 'Itens', 'Total', 'Pagamento', 'Colaborador'],
      ...vendasFiltradas.map(venda => [
        venda.id,
        formatarDataHora(venda.dataHora),
        venda.cafeteria,
        venda.usuario,
        getItensFormatados(venda.itens),
        `R$ ${venda.total.toFixed(2)}`,
        venda.tipoPagamento,
        venda.colaborador || ''
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico_vendas_${formatarData(dataInicio)}_a_${formatarData(dataFim)}.csv`;
    link.click();
  };

  return (
    <div className="container-fluid">
      <h2>Histórico de Vendas</h2>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtros</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Data Início</label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Cafeteria</label>
              <select
                className="form-select"
                value={cafeteriaFiltro}
                onChange={(e) => setCafeteriaFiltro(e.target.value)}
              >
                {cafeteriasUnicas.map(cafeteria => (
                  <option key={cafeteria} value={cafeteria}>
                    {cafeteria}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Usuário</label>
              <select
                className="form-select"
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(e.target.value)}
              >
                {usuariosUnicos.map(usuario => (
                  <option key={usuario} value={usuario}>
                    {usuario}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary me-2" onClick={filtrarVendas}>
              Aplicar Filtros
            </button>
            <button className="btn btn-success" onClick={exportarCSV}>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="card">
        <div className="card-header">
          <h5>Resultados ({vendasFiltradas.length} vendas encontradas)</h5>
        </div>
        <div className="card-body">
          {vendasFiltradas.length === 0 ? (
            <p className="text-muted">Nenhuma venda encontrada para os filtros selecionados.</p>
          ) : (
            <div className="list-group">
              {vendasFiltradas.map((venda) => (
                <div key={venda.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        {formatarDataHora(venda.dataHora)} - ID: {venda.id}
                      </h6>
                      <p className="mb-1">
                        <strong>Usuário:</strong> {venda.usuario}
                      </p>
                      <p className="mb-1">
                        <strong>Itens:</strong> {getItensFormatados(venda.itens)}
                      </p>
                      <p className="mb-1">
                        <strong>Total:</strong> R$ {venda.total.toFixed(2)}
                      </p>
                      <p className="mb-1">
                        <strong>Pagamento:</strong> {venda.tipoPagamento}
                      </p>
                      <p className="mb-1">
                        <strong>Cafeteria:</strong> {venda.cafeteria}
                      </p>
                      {venda.colaborador && (
                        <p className="mb-1 text-info">
                          <strong>Venda para colaborador:</strong> {venda.colaborador}
                        </p>
                      )}
                    </div>
                    <div className="text-end">
                      <span className="badge bg-success fs-6">
                        R$ {venda.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Detalhes dos itens */}
                  <div className="mt-3">
                    <h6>Detalhes dos Itens:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Preço Unit.</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {venda.itens.map((item, index) => (
                            <tr key={index}>
                              <td>{item.nome}</td>
                              <td>{item.quantidade}</td>
                              <td>R$ {item.preco.toFixed(2)}</td>
                              <td>R$ {item.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historico;