// src/components/Pages/Produtos.js
import React, { useState, useEffect } from 'react';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarMovimentacao, setMostrarMovimentacao] = useState(false); // Novo estado para controlar a exibição

  // Estado do formulário de produtos
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Bebida',
    preco: '',
    estoque: '',
    usaEstoqueMinimo: false,
    estoqueMinimo: ''
  });

  // Estado para movimentações (incorporado de Movimentacoes.js)
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [filtrosMovimentacao, setFiltrosMovimentacao] = useState({
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

  // Tipos de movimentação (incorporado de Movimentacoes.js)
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
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setError('Erro ao carregar produtos do servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Buscar movimentações do backend (incorporado de Movimentacoes.js)
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
            produtoNome: mov.productId?.name || 'Produto não encontrado',
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
        }
      } catch (error) {
        console.error('Erro ao buscar movimentações do backend:', error);
      }
    };

    fetchMovimentacoes();
  }, []);

  // Categorias únicas para filtro
  const categorias = ['Todas', ...new Set(produtos.map(p => p.categoria))];

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = filtroCategoria === 'Todas' || produto.categoria === filtroCategoria;
    const passaBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    return passaCategoria && passaBusca;
  });

  // Filtrar movimentações (incorporado de Movimentacoes.js)
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const dataMov = new Date(mov.dataHora);
    const dataInicio = new Date(filtrosMovimentacao.dataInicio);
    const dataFim = new Date(filtrosMovimentacao.dataFim);
    dataFim.setHours(23, 59, 59, 999);

    const passaCafeteria = filtrosMovimentacao.cafeteria === 'Todas' || mov.cafeteria === filtrosMovimentacao.cafeteria;
    const passaTipo = filtrosMovimentacao.tipo === 'Todos' || mov.tipo === filtrosMovimentacao.tipo;
    const passaData = dataMov >= dataInicio && dataMov <= dataFim;

    return passaCafeteria && passaTipo && passaData;
  });

  // Handlers para produtos
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handlers para movimentações (incorporado de Movimentacoes.js)
  const handleInputChangeMovimentacao = (e) => {
    const { name, value } = e.target;
    setNovaMovimentacao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFiltroChangeMovimentacao = (e) => {
    const { name, value } = e.target;
    setFiltrosMovimentacao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      alert('Nome do produto é obrigatório!');
      return false;
    }
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      alert('Preço deve ser maior que zero!');
      return false;
    }
    if (!formData.estoque || parseInt(formData.estoque) < 0) {
      alert('Estoque não pode ser negativo!');
      return false;
    }
    if (formData.usaEstoqueMinimo && (!formData.estoqueMinimo || parseInt(formData.estoqueMinimo) < 0)) {
      alert('Estoque mínimo é obrigatório quando marcado!');
      return false;
    }
    return true;
  };

  // Validação de movimentação (incorporado de Movimentacoes.js)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    const produtoData = {
      nome: formData.nome.trim(),
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      estoque: parseInt(formData.estoque),
      estoqueMinimo: formData.usaEstoqueMinimo ? parseInt(formData.estoqueMinimo) : 0
    };

    try {
      const url = modoEdicao 
        ? `http://localhost:5001/api/products/${produtoEditando._id}`
        : 'http://localhost:5001/api/products';
      
      const method = modoEdicao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produtoData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar produto');
      }

      const produtoSalvo = await response.json();
      
      if (modoEdicao) {
        setProdutos(produtos.map(p => p._id === produtoEditando._id ? produtoSalvo : p));
        alert('Produto atualizado com sucesso!');
      } else {
        setProdutos([...produtos, produtoSalvo]);
        alert('Produto cadastrado com sucesso!');
      }

      // Limpar formulário
      setFormData({
        nome: '',
        categoria: 'Bebida',
        preco: '',
        estoque: '',
        usaEstoqueMinimo: false,
        estoqueMinimo: ''
      });
      setModoEdicao(false);
      setProdutoEditando(null);

    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto!');
    }
  };

  // Registrar movimentação (incorporado de Movimentacoes.js)
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
      newStock: 0
    };

    console.log('📤 Enviando para o backend:', movimentoParaBackend);

    try {
      const response = await fetch('http://localhost:5001/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimentoParaBackend),
      });

      const responseData = await response.json();
      console.log('📥 Resposta do backend:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro ao registrar movimentação');
      }

      console.log('✅ Movimentação registrada no backend:', responseData);
      
      // Recarregar dados do backend
      const [produtosResponse, movResponse] = await Promise.all([
        fetch('http://localhost:5001/api/products'),
        fetch('http://localhost:5001/api/movements')
      ]);
      
      if (produtosResponse.ok) {
        const produtosAtualizados = await produtosResponse.json();
        setProdutos(produtosAtualizados);
      }
      
      if (movResponse.ok) {
        const movimentacoesAtualizadas = await movResponse.json();
        const movimentacoesFormatadas = movimentacoesAtualizadas.map(mov => ({
          id: mov._id,
          dataHora: mov.createdAt,
          produtoId: mov.productId,
          produtoNome: mov.productId?.name || 'Produto não encontrado',
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
      }
      
      // Resetar formulário
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
      console.error('❌ Erro detalhado:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  const editarProduto = (produto) => {
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      usaEstoqueMinimo: produto.estoqueMinimo !== null && produto.estoqueMinimo > 0,
      estoqueMinimo: produto.estoqueMinimo !== null ? produto.estoqueMinimo.toString() : ''
    });
    setProdutoEditando(produto);
    setModoEdicao(true);
  };

  const excluirProduto = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/products/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Erro ao excluir produto');
        }

        setProdutos(produtos.filter(p => p._id !== id));
        alert('Produto excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto!');
      }
    }
  };

  const cancelarEdicao = () => {
    setFormData({
      nome: '',
      categoria: 'Bebida',
      preco: '',
      estoque: '',
      usaEstoqueMinimo: false,
      estoqueMinimo: ''
    });
    setModoEdicao(false);
    setProdutoEditando(null);
  };

  // Funções auxiliares para movimentações (incorporado de Movimentacoes.js)
  const getSinalQuantidade = (tipo) => {
    if (['entrada', 'ajuste_entrada'].includes(tipo)) return '+';
    if (['ajuste_saida', 'perda', 'venda'].includes(tipo)) return '-';
    return '';
  };

  const getTipoLabel = (tipo) => {
    const tipoObj = tiposMovimentacao.find(t => t.value === tipo);
    return tipoObj ? `${tipoObj.icon} ${tipoObj.label}` : tipo;
  };

  const formatarDataHora = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR');
  };

  const getStatusEstoque = (produto) => {
    if (produto.estoqueMinimo > 0 && produto.estoque <= produto.estoqueMinimo) {
      return 'danger'; // Estoque crítico
    }
    if (produto.estoque === 0) {
      return 'secondary'; // Esgotado
    }
    return 'success'; // Normal
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <h2>Gerenciar Produtos</h2>
        <div className="alert alert-info">Carregando produtos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <h2>Gerenciar Produtos</h2>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciar Produtos</h2>
        <div>
          <button 
            className={`btn ${mostrarMovimentacao ? 'btn-outline-primary' : 'btn-primary'} me-2`}
            onClick={() => setMostrarMovimentacao(false)}
          >
            Gerenciar Produtos
          </button>
          <button 
            className={`btn ${mostrarMovimentacao ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMostrarMovimentacao(true)}
          >
            Nova Movimentação
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtros</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Buscar Produto</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o nome do produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Total de Produtos</label>
              <div className="form-control bg-light">
                <strong>{produtosFiltrados.length}</strong> produtos encontrados
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Formulário de Produto ou Movimentação */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>
                {mostrarMovimentacao ? 'Nova Movimentação' : 
                 (modoEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto')}
              </h5>
            </div>
            <div className="card-body">
              {mostrarMovimentacao ? (
                // Formulário de Movimentação (incorporado de Movimentacoes.js)
                <form onSubmit={registrarMovimentacao}>
                  <div className="mb-3">
                    <label className="form-label">Produto *</label>
                    <select
                      className="form-select"
                      name="productId"
                      value={novaMovimentacao.productId}
                      onChange={handleInputChangeMovimentacao}
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
                      onChange={handleInputChangeMovimentacao}
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
                      onChange={handleInputChangeMovimentacao}
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
                        onChange={handleInputChangeMovimentacao}
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
                        onChange={handleInputChangeMovimentacao}
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
                      onChange={handleInputChangeMovimentacao}
                    >
                      <option value="Cafeteria Principal">Cafeteria Principal</option>
                      <option value="Cafeteria 2">Cafeteria 2</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Registrar Movimentação
                  </button>
                </form>
              ) : (
                // Formulário de Produto (original)
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nome do Produto *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoria *</label>
                    <select
                      className="form-select"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Bebida">Bebida</option>
                      <option value="Alimento">Alimento</option>
                      <option value="Sobremesa">Sobremesa</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-control"
                      name="preco"
                      value={formData.preco}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Estoque Atual *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="estoque"
                      value={formData.estoque}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="usaEstoqueMinimo"
                      checked={formData.usaEstoqueMinimo}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Usar Estoque Mínimo</label>
                  </div>

                  {formData.usaEstoqueMinimo && (
                    <div className="mb-3">
                      <label className="form-label">Estoque Mínimo *</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="estoqueMinimo"
                        value={formData.estoqueMinimo}
                        onChange={handleInputChange}
                        required={formData.usaEstoqueMinimo}
                      />
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      {modoEdicao ? 'Atualizar Produto' : 'Cadastrar Produto'}
                    </button>
                    {modoEdicao && (
                      <button type="button" className="btn btn-secondary" onClick={cancelarEdicao}>
                        Cancelar Edição
                    </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Filtros de Movimentação (visíveis apenas quando mostrarMovimentacao é true) */}
          {mostrarMovimentacao && (
            <div className="card mt-4">
              <div className="card-header">
                <h5>Filtros de Movimentação</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Cafeteria</label>
                    <select
                      className="form-select"
                      name="cafeteria"
                      value={filtrosMovimentacao.cafeteria}
                      onChange={handleFiltroChangeMovimentacao}
                    >
                      <option value="Todas">Todas</option>
                      <option value="Cafeteria Principal">Cafeteria Principal</option>
                      <option value="Cafeteria 2">Cafeteria 2</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tipo</label>
                    <select
                      className="form-select"
                      name="tipo"
                      value={filtrosMovimentacao.tipo}
                      onChange={handleFiltroChangeMovimentacao}
                    >
                      <option value="Todos">Todos</option>
                      {tiposMovimentacao.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Data Início</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataInicio"
                      value={filtrosMovimentacao.dataInicio}
                      onChange={handleFiltroChangeMovimentacao}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Data Fim</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dataFim"
                      value={filtrosMovimentacao.dataFim}
                      onChange={handleFiltroChangeMovimentacao}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Produtos ou Movimentações */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>
                {mostrarMovimentacao 
                  ? `Histórico de Movimentações (${movimentacoesFiltradas.length})` 
                  : 'Lista de Produtos'}
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {mostrarMovimentacao ? (
                  // Tabela de Movimentações (incorporado de Movimentacoes.js)
                  <table className="table table-striped">
                    <thead>
                      <tr>
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
                ) : (
                  // Tabela de Produtos (original)
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Estoque Mín.</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosFiltrados.map(produto => (
                        <tr key={produto._id} className={`table-${getStatusEstoque(produto)}`}>
                          <td>{produto._id}</td>
                          <td>
                            <strong>{produto.nome}</strong>
                            {getStatusEstoque(produto) === 'danger' && (
                              <span className="badge bg-danger ms-2">Baixo Estoque</span>
                            )}
                            {getStatusEstoque(produto) === 'secondary' && (
                              <span className="badge bg-secondary ms-2">Esgotado</span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-info">{produto.categoria}</span>
                          </td>
                          <td>R$ {produto.preco.toFixed(2)}</td>
                          <td>
                            <span className={`badge bg-${getStatusEstoque(produto)}`}>
                              {produto.estoque}
                            </span>
                          </td>
                          <td>
                            {produto.estoqueMinimo !== null && produto.estoqueMinimo > 0 ? (
                              <span className="badge bg-warning">{produto.estoqueMinimo}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {getStatusEstoque(produto) === 'danger' && '⛔ Crítico'}
                            {getStatusEstoque(produto) === 'secondary' && '❌ Esgotado'}
                            {getStatusEstoque(produto) === 'success' && '✅ Normal'}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => editarProduto(produto)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => excluirProduto(produto._id)}
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {mostrarMovimentacao ? (
                movimentacoesFiltradas.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <p>Nenhuma movimentação encontrada.</p>
                  </div>
                )
              ) : (
                produtosFiltrados.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <p>Nenhum produto encontrado.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Produtos;