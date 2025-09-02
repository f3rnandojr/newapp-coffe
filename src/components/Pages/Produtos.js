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

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Bebida',
    preco: '',
    estoque: '',
    usaEstoqueMinimo: false,
    estoqueMinimo: ''
  });

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

  // Categorias únicas para filtro
  const categorias = ['Todas', ...new Set(produtos.map(p => p.categoria))];

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const passaCategoria = filtroCategoria === 'Todas' || produto.categoria === filtroCategoria;
    const passaBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    return passaCategoria && passaBusca;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      <h2>Gerenciar Produtos</h2>

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
        {/* Formulário */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>{modoEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h5>
            </div>
            <div className="card-body">
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
            </div>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Lista de Produtos</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
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
              </div>

              {produtosFiltrados.length === 0 && (
                <div className="text-center text-muted py-4">
                  <p>Nenhum produto encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Produtos;