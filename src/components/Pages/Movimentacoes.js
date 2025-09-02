// src/components/Pages/Movimentacoes.js
import React, { useState, useEffect } from 'react';

const Movimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    cafeteria: 'Todas',
    tipo: 'Todos',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    productId: '',
    tipo: 'entrada',
    quantidade: '',
    motivo: '',
    notaFiscal: '',
    cafeteria: 'Cafeteria Principal'
  });

  // Tipos de movimentação
  const tiposMovimentacao = [
    { value: 'entrada', label: 'Entrada - Nota Fiscal', icon: '📥' },
    { value: 'ajuste_entrada', label: 'Ajuste - Entrada', icon: '📈' },
    { value: 'ajuste_saida', label: 'Ajuste - Saída', icon: '📉' },
    { value: 'perda', label: 'Perda/Avaria', icon: '⚠️' },
    { value: 'venda', label: 'Saída - Venda', icon: '💰' }
  ];

  // Buscar produtos do backend
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/products');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar produtos');
        }
        
        const produtosData = await response.json();
        console.log('📦 Produtos carregados do backend:', produtosData);
        setProdutos(produtosData);
        
        // Salvar produtos no localStorage como backup
        localStorage.setItem('cafeteria_produtos', JSON.stringify(produtosData));
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setError('Erro ao carregar produtos do servidor');
        // Fallback para dados locais em caso de erro
        const produtosSalvos = localStorage.getItem('cafeteria_produtos');
        if (produtosSalvos) {
          setProdutos(JSON.parse(produtosSalvos));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Buscar movimentações do backend
// Buscar movimentações do backend
useEffect(() => {
  const fetchMovimentacoes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/movements');
      if (response.ok) {
        const movimentacoesData = await response.json();
        
        // Mapear os dados do backend para o formato do frontend
        const movimentacoesFormatadas = movimentacoesData.map(mov => ({
          id: mov._id,
          dataHora: mov.createdAt,
          produtoId: mov.productId,
          produtoNome: mov.productId?.name || 'Produto não encontrado', // Se o populate não funcionar
          tipo: mov.type,
          quantidade: mov.quantity,
          motivo: mov.note,
          notaFiscal: mov.invoiceNumber,
          usuario: mov.user,
          cafeteria: mov.cafeteria,
          estoqueAnterior: mov.previousStock,
          estoqueAtual: mov.newStock
        }));
        
        setMovimentacoes(movimentacoesFormatadas);
        localStorage.setItem('cafeteria_movimentacoes', JSON.stringify(movimentacoesFormatadas));
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações do backend:', error);
      // Fallback para localStorage
      const movimentacoesSalvas = localStorage.getItem('cafeteria_movimentacoes');
      if (movimentacoesSalvas) {
        setMovimentacoes(JSON.parse(movimentacoesSalvas));
      }
    }
  };

  fetchMovimentacoes();
}, []);

  // Salvar movimentações no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('cafeteria_movimentacoes', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  // Salvar produtos quando mudarem
  useEffect(() => {
    localStorage.setItem('cafeteria_produtos', JSON.stringify(produtos));
  }, [produtos]);

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const dataMov = new Date(mov.dataHora);
    const dataInicio = new Date(filtros.dataInicio);
    const dataFim = new Date(filtros.dataFim);
    dataFim.setHours(23, 59, 59, 999);

    const passaCafeteria = filtros.cafeteria === 'Todas' || mov.cafeteria === filtros.cafeteria;
    const passaTipo = filtros.tipo === 'Todos' || mov.tipo === filtros.tipo;
    const passaData = dataMov >= dataInicio && dataMov <= dataFim;

    return passaCafeteria && passaTipo && passaData;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaMovimentacao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getSinalQuantidade = (tipo) => {
    if (['entrada', 'ajuste_entrada'].includes(tipo)) return '+';
    if (['ajuste_saida', 'perda', 'venda'].includes(tipo)) return '-';
    return '';
  };

  const getTipoLabel = (tipo) => {
    const tipoObj = tiposMovimentacao.find(t => t.value === tipo);
    return tipoObj ? `${tipoObj.icon} ${tipoObj.label}` : tipo;
  };

  const validarMovimentacao = () => {
    if (!novaMovimentacao.productId) {
      alert('Selecione um produto!');
      return false;
    }
    if (!novaMovimentacao.quantidade || parseInt(novaMovimentacao.quantidade) <= 0) {
      alert('Quantidade deve ser maior que zero!');
      return false;
    }
    if (novaMovimentacao.tipo === 'entrada' && !novaMovimentacao.notaFiscal) {
      alert('Nota fiscal é obrigatória para entrada!');
      return false;
    }
    if (['ajuste_saida', 'perda', 'venda'].includes(novaMovimentacao.tipo) && !novaMovimentacao.motivo) {
      alert('Motivo é obrigatório para saídas!');
      return false;
    }
    return true;
  };

  const atualizarEstoqueLocal = (productId, quantidade, tipo) => {
    const updatedProdutos = produtos.map(produto => {
      if (produto._id === productId) {
        let novoEstoque = produto.estoque;
        
        if (['entrada', 'ajuste_entrada'].includes(tipo)) {
          novoEstoque += parseInt(quantidade);
        } else if (['ajuste_saida', 'perda', 'venda'].includes(tipo)) {
          novoEstoque = Math.max(0, novoEstoque - parseInt(quantidade));
        }

        return { ...produto, estoque: novoEstoque };
      }
      return produto;
    });

    setProdutos(updatedProdutos);
    return updatedProdutos.find(p => p._id === productId)?.estoque || 0;
  };

  const registrarMovimentacao = async (e) => {
    e.preventDefault();

    if (!validarMovimentacao()) return;

    const produto = produtos.find(p => p._id === novaMovimentacao.productId);
    if (!produto) {
      alert('Produto não encontrado!');
      return;
    }

    const estoqueAnterior = produto.estoque;

    const movimentoParaBackend = {
      productId: novaMovimentacao.productId,
      type: novaMovimentacao.tipo,
      quantity: parseInt(novaMovimentacao.quantidade),
      note: novaMovimentacao.motivo,
      invoiceNumber: novaMovimentacao.notaFiscal,
      user: 'admin',
      cafeteria: novaMovimentacao.cafeteria,
      previousStock: estoqueAnterior,
      newStock: 0 // O backend vai calcular isso
    };

    try {
      const response = await fetch('http://localhost:5001/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimentoParaBackend),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar movimentação no servidor');
      }

      const data = await response.json();
      console.log('Movimentação registrada no backend:', data);
      
      // Buscar produtos atualizados do backend
      const produtosResponse = await fetch('http://localhost:5001/api/products');
      const produtosAtualizados = await produtosResponse.json();
      setProdutos(produtosAtualizados);
      
      // Buscar movimentações atualizadas do backend
      const movResponse = await fetch('http://localhost:5001/api/movements');
      const movimentacoesAtualizadas = await movResponse.json();
      setMovimentacoes(movimentacoesAtualizadas);
      
      setNovaMovimentacao({
        productId: '',
        tipo: 'entrada',
        quantidade: '',
        motivo: '',
        notaFiscal: '',
        cafeteria: 'Cafeteria Principal'
      });

      alert('Movimentação registrada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao registrar movimentação no servidor. Salvando localmente.');
      
      // Fallback local
      const estoqueAtual = atualizarEstoqueLocal(
        novaMovimentacao.productId,
        novaMovimentacao.quantidade,
        novaMovimentacao.tipo
      );
      
      const novaMov = {
        id: Date.now(),
        dataHora: new Date().toISOString(),
        produtoId: novaMovimentacao.productId,
        produtoNome: produto.nome,
        tipo: novaMovimentacao.tipo,
        quantidade: parseInt(novaMovimentacao.quantidade),
        motivo: novaMovimentacao.motivo,
        notaFiscal: novaMovimentacao.notaFiscal,
        usuario: 'admin',
        cafeteria: novaMovimentacao.cafeteria,
        estoqueAnterior: estoqueAnterior,
        estoqueAtual: estoqueAtual
      };
      
      setMovimentacoes([novaMov, ...movimentacoes]);
      
      setNovaMovimentacao({
        productId: '',
        tipo: 'entrada',
        quantidade: '',
        motivo: '',
        notaFiscal: '',
        cafeteria: 'Cafeteria Principal'
      });

      alert('Movimentação registrada localmente!');
    }
  };

  const formatarDataHora = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h2>Movimentações de Estoque</h2>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtros</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Cafeteria</label>
              <select
                className="form-select"
                name="cafeteria"
                value={filtros.cafeteria}
                onChange={handleFiltroChange}
              >
                <option value="Todas">Todas</option>
                <option value="Cafeteria Principal">Cafeteria Principal</option>
                <option value="Cafeteria 2">Cafeteria 2</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
              >
                <option value="Todos">Todos</option>
                {tiposMovimentacao.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Data Início</label>
              <input
                type="date"
                className="form-control"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Data Fim</label>
              <input
                type="date"
                className="form-control"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Nova Movimentação */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Nova Movimentação</h5>
            </div>
            <div className="card-body">
              <form onSubmit={registrarMovimentacao}>
                <div className="mb-3">
                  <label className="form-label">Produto *</label>
                  <select
                    className="form-select"
                    name="productId"
                    value={novaMovimentacao.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto._id} value={produto._id}>
                        {produto.nome} (Estoque: {produto.estoque})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Movimentação *</label>
                  <select
                    className="form-select"
                    name="tipo"
                    value={novaMovimentacao.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    {tiposMovimentacao.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    name="quantidade"
                    value={novaMovimentacao.quantidade}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {novaMovimentacao.tipo === 'entrada' && (
                  <div className="mb-3">
                    <label className="form-label">Número da Nota Fiscal *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="notaFiscal"
                      value={novaMovimentacao.notaFiscal}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                {['ajuste_saida', 'perda', 'venda'].includes(novaMovimentacao.tipo) && (
                  <div className="mb-3">
                    <label className="form-label">Motivo *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="motivo"
                      value={novaMovimentacao.motivo}
                      onChange={handleInputChange}
                      required
                      placeholder="Ex: Ajuste de estoque, Perda, Venda, etc."
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Cafeteria</label>
                  <select
                    className="form-select"
                    name="cafeteria"
                    value={novaMovimentacao.cafeteria}
                    onChange={handleInputChange}
                  >
                    <option value="Cafeteria Principal">Cafeteria Principal</option>
                    <option value="Cafeteria 2">Cafeteria 2</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Registrar Movimentação
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Histórico de Movimentações ({movimentacoesFiltradas.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data/Hora</th>
                      <th>Produto</th>
                      <th>Tipo</th>
                      <th>Quantidade</th>
                      <th>NF/Motivo</th>
                      <th>Usuário</th>
                      <th>Cafeteria</th>
                      <th>Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoesFiltradas.map(mov => (
                      <tr key={mov.id}>
                        <td>{mov.id}</td>
                        <td>{formatarDataHora(mov.dataHora)}</td>
                        <td>
                          <strong>{mov.produtoNome}</strong>
                        </td>
                        <td>{getTipoLabel(mov.tipo)}</td>
                        <td>
                          <span className={
                            ['entrada', 'ajuste_entrada'].includes(mov.tipo) 
                              ? 'text-success' 
                              : 'text-danger'
                          }>
                            {getSinalQuantidade(mov.tipo)}{mov.quantidade}
                          </span>
                        </td>
                        <td>
                          {mov.tipo === 'entrada' ? (
                            <span className="badge bg-info">NF: {mov.notaFiscal}</span>
                          ) : (
                            <span className="text-muted">{mov.motivo}</span>
                          )}
                        </td>
                        <td>{mov.usuario}</td>
                        <td>{mov.cafeteria}</td>
                        <td>
                          <small className="text-muted">
                            {mov.estoqueAnterior} → {mov.estoqueAtual}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {movimentacoesFiltradas.length === 0 && (
                <div className="text-center text-muted py-4">
                  <p>Nenhuma movimentação encontrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movimentacoes;