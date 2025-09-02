// src/components/Pages/ContasReceber.js
import React, { useState, useEffect } from 'react';
import { useVendas } from '../../contexts/VendasContext';

const ContasReceber = () => {
  const { vendas } = useVendas();
  const [contasReceber, setContasReceber] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [filtros, setFiltros] = useState({
    mesAno: '',
    colaborador: 'Todos',
    departamento: 'Todos',
    status: 'Todos'
  });

  // Carregar colaboradores do localStorage
  useEffect(() => {
    const colaboradoresSalvos = localStorage.getItem('cafeteria_colaboradores');
    if (colaboradoresSalvos) {
      setColaboradores(JSON.parse(colaboradoresSalvos));
    }
  }, []);

  // Processar vendas para contas a receber
  useEffect(() => {
    const vendasColaboradores = vendas.filter(venda => venda.colaborador);
    
    const contasProcessadas = vendasColaboradores.map(venda => {
      const colaborador = colaboradores.find(colab => colab.id === parseInt(venda.colaborador));
      
      return {
        id: venda.id,
        dataVenda: venda.dataHora,
        colaboradorId: venda.colaborador,
        colaboradorNome: colaborador ? colaborador.nome : 'Colaborador não encontrado',
        departamento: colaborador ? colaborador.setor : 'N/A',
        itens: venda.itens,
        valor: venda.total,
        status: 'Pendente', // Todos começam como pendentes
        dataPagamento: null
      };
    });

    setContasReceber(contasProcessadas);
  }, [vendas, colaboradores]);

  // Obter meses/anos disponíveis
  const mesesAnos = [...new Set(contasReceber.map(conta => {
    const date = new Date(conta.dataVenda);
    return `${date.toLocaleString('pt-BR', { month: 'long' })} de ${date.getFullYear()}`;
  }))];

  // Obter departamentos únicos
  const departamentos = ['Todos', ...new Set(contasReceber.map(conta => conta.departamento))];

  // Filtrar contas
  const contasFiltradas = contasReceber.filter(conta => {
    const date = new Date(conta.dataVenda);
    const mesAnoConta = `${date.toLocaleString('pt-BR', { month: 'long' })} de ${date.getFullYear()}`;
    
    const passaMesAno = filtros.mesAno === '' || filtros.mesAno === 'Todos' || mesAnoConta === filtros.mesAno;
    const passaColaborador = filtros.colaborador === 'Todos' || conta.colaboradorNome === filtros.colaborador;
    const passaDepartamento = filtros.departamento === 'Todos' || conta.departamento === filtros.departamento;
    const passaStatus = filtros.status === 'Todos' || conta.status === filtros.status;

    return passaMesAno && passaColaborador && passaDepartamento && passaStatus;
  });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const formatarMesAno = (dataISO) => {
    const date = new Date(dataISO);
    return `${date.toLocaleString('pt-BR', { month: 'long' })} de ${date.getFullYear()}`;
  };

  const getItensFormatados = (itens) => {
    return itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
  };

  const marcarComoPago = (id) => {
    if (window.confirm('Deseja marcar esta conta como paga?')) {
      setContasReceber(contasReceber.map(conta => 
        conta.id === id 
          ? { ...conta, status: 'Pago', dataPagamento: new Date().toISOString() }
          : conta
      ));
      alert('Conta marcada como paga!');
    }
  };

  const marcarComoPendente = (id) => {
    if (window.confirm('Deseja marcar esta conta como pendente?')) {
      setContasReceber(contasReceber.map(conta => 
        conta.id === id 
          ? { ...conta, status: 'Pendente', dataPagamento: null }
          : conta
      ));
      alert('Conta marcada como pendente!');
    }
  };

  const exportarRelatorio = () => {
    const csvContent = [
      ['ID', 'Data Venda', 'Colaborador', 'Departamento', 'Itens', 'Valor', 'Status', 'Data Pagamento'],
      ...contasFiltradas.map(conta => [
        conta.id,
        formatarData(conta.dataVenda),
        conta.colaboradorNome,
        conta.departamento,
        getItensFormatados(conta.itens),
        `R$ ${conta.valor.toFixed(2)}`,
        conta.status,
        conta.dataPagamento ? formatarData(conta.dataPagamento) : ''
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contas_receber_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getTotalPendente = () => {
    return contasFiltradas
      .filter(conta => conta.status === 'Pendente')
      .reduce((total, conta) => total + conta.valor, 0);
  };

  const getTotalPago = () => {
    return contasFiltradas
      .filter(conta => conta.status === 'Pago')
      .reduce((total, conta) => total + conta.valor, 0);
  };

  return (
    <div className="container-fluid">
      <h2>Contas a Receber</h2>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>Total Pendente</h5>
              <h3>R$ {getTotalPendente().toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5>Total Recebido</h5>
              <h3>R$ {getTotalPago().toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5>Total de Contas</h5>
              <h3>{contasFiltradas.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtros</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Mês/Ano</label>
              <select
                className="form-select"
                name="mesAno"
                value={filtros.mesAno}
                onChange={handleFiltroChange}
              >
                <option value="Todos">Todos</option>
                {mesesAnos.map(mesAno => (
                  <option key={mesAno} value={mesAno}>{mesAno}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Colaborador</label>
              <select
                className="form-select"
                name="colaborador"
                value={filtros.colaborador}
                onChange={handleFiltroChange}
              >
                <option value="Todos">Todos</option>
                {[...new Set(contasReceber.map(conta => conta.colaboradorNome))].map(nome => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Departamento</label>
              <select
                className="form-select"
                name="departamento"
                value={filtros.departamento}
                onChange={handleFiltroChange}
              >
                <option value="Todos">Todos</option>
                {departamentos.filter(dept => dept !== 'Todos').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filtros.status}
                onChange={handleFiltroChange}
              >
                <option value="Todos">Todos</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Contas a Receber ({contasFiltradas.length})</h5>
          <button className="btn btn-success btn-sm" onClick={exportarRelatorio}>
            📊 Exportar Relatório
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data Venda</th>
                  <th>Colaborador</th>
                  <th>Departamento</th>
                  <th>Itens</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contasFiltradas.map(conta => (
                  <tr key={conta.id} className={conta.status === 'Pendente' ? 'table-warning' : 'table-success'}>
                    <td>{conta.id}</td>
                    <td>{formatarData(conta.dataVenda)}</td>
                    <td>
                      <strong>{conta.colaboradorNome}</strong>
                    </td>
                    <td>
                      <span className="badge bg-info">{conta.departamento}</span>
                    </td>
                    <td>
                      <small>{getItensFormatados(conta.itens)}</small>
                    </td>
                    <td>
                      <strong>R$ {conta.valor.toFixed(2)}</strong>
                    </td>
                    <td>
                      {conta.status === 'Pendente' ? (
                        <span className="badge bg-warning">⏳ Pendente</span>
                      ) : (
                        <span className="badge bg-success">✅ Pago</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {conta.status === 'Pendente' ? (
                          <button
                            className="btn btn-outline-success"
                            onClick={() => marcarComoPago(conta.id)}
                            title="Marcar como Pago"
                          >
                            💰 Pagar
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => marcarComoPendente(conta.id)}
                            title="Marcar como Pendente"
                          >
                            ↩️ Reabrir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contasFiltradas.length === 0 && (
            <div className="text-center text-muted py-4">
              <p>Nenhuma conta a receber encontrada.</p>
            </div>
          )}

          {/* Totais */}
          {contasFiltradas.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="alert alert-warning">
                  <strong>Total Pendente: R$ {getTotalPendente().toFixed(2)}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-success">
                  <strong>Total Recebido: R$ {getTotalPago().toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContasReceber;