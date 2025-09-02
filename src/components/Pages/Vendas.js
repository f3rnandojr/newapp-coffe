// src/components/Pages/Vendas.js
import React, { useState, useEffect } from 'react';
import { useCafeteria } from '../../contexts/CafeteriaContext';
import { useAuth } from '../../contexts/AuthContext';
import { useVendas } from '../../contexts/VendasContext';

const Vendas = () => {
  const { currentCafeteria } = useCafeteria();
  const { user } = useAuth();
  const { registrarVenda } = useVendas();
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [itensVenda, setItensVenda] = useState([]);
  const [isVendaColaborador, setIsVendaColaborador] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState('dinheiro');
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para calcular o total
  const calcularTotal = () => {
    return itensVenda.reduce((total, item) => total + item.subtotal, 0);
  };

  // Buscar produtos e colaboradores do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar produtos
        const produtosResponse = await fetch('http://localhost:5001/api/products');
        const produtosData = await produtosResponse.json();
        setProdutos(produtosData);
        setFilteredProdutos(produtosData);
        
        // Buscar colaboradores
        const colaboradoresResponse = await fetch('http://localhost:5001/api/collaborators');
        const colaboradoresData = await colaboradoresResponse.json();
        setColaboradores(colaboradoresData);
        
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar dados do servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtro de produtos com autocomplete
    const filtered = produtos.filter(produto =>
      (produto.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProdutos(filtered);
  }, [searchTerm, produtos]);

  const adicionarItem = (produto) => {
    const itemExistente = itensVenda.find(item => item.id === produto._id || item._id === produto._id);
    
    if (itemExistente) {
      setItensVenda(itensVenda.map(item =>
        (item.id === produto._id || item._id === produto._id)
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * (item.preco || item.price || 0) }
          : item
      ));
    } else {
      setItensVenda([...itensVenda, {
        ...produto,
        id: produto._id,
        quantidade: 1,
        subtotal: produto.preco || produto.price || 0
      }]);
    }
    setSearchTerm('');
  };

  const removerItem = (id) => {
    setItensVenda(itensVenda.filter(item => item.id !== id && item._id !== id));
  };

  const atualizarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerItem(id);
      return;
    }

    setItensVenda(itensVenda.map(item =>
      (item.id === id || item._id === id)
        ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * (item.preco || item.price || 0) }
        : item
    ));
  };

  const finalizarVenda = async () => {
    if (itensVenda.length === 0) {
      alert('Adicione itens à venda!');
      return;
    }

    if (isVendaColaborador && !colaboradorSelecionado) {
      alert('Selecione um colaborador!');
      return;
    }

    const venda = {
      cafeteria: currentCafeteria?.nome || 'Cafeteria Principal',
      itens: itensVenda.map(item => ({
        productId: item.id || item._id,
        name: item.nome || item.name,
        price: item.preco || item.price,
        quantity: item.quantidade,
        subtotal: item.subtotal
      })),
      usuario: user?.email || 'Usuário não identificado',
      tipoPagamento: isVendaColaborador ? 'débito corporativo' : tipoPagamento,
      total: calcularTotal(),
      collaboratorId: isVendaColaborador ? colaboradorSelecionado : null
    };

    try {
      const response = await fetch('http://localhost:5001/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venda)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar venda');
      }

      const vendaRegistrada = await response.json();
      console.log('Venda registrada:', vendaRegistrada);
      alert('Venda registrada com sucesso!');
      
      // Limpar formulário
      setItensVenda([]);
      setIsVendaColaborador(false);
      setColaboradorSelecionado('');
      setTipoPagamento('dinheiro');
      
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert(error.message || 'Erro ao registrar venda!');
    }
  };

  return (
    <div className="container-fluid">
      <h2>Registrar Venda</h2>
      
      {loading && <div className="alert alert-info">Carregando...</div>}
      
      <div className="row">
        {/* Coluna de Produtos */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Selecionar Produtos</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="list-group">
                {filteredProdutos.map(produto => (
                  <button
                    key={produto._id}
                    className="list-group-item list-group-item-action"
                    onClick={() => adicionarItem(produto)}
                  >
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{produto.nome || produto.name}</strong>
                        <br />
                        <small className="text-muted">{produto.categoria || produto.category}</small>
                      </div>
                      <div>
                        <span className="badge bg-primary rounded-pill">
                          R$ {(produto.preco || produto.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna de Finalização */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Finalizar Venda</h5>
            </div>
            <div className="card-body">
              {/* Forma de Pagamento */}
              <div className="mb-3">
                <label className="form-label">Forma de Pagamento</label>
                <select
                  className="form-select"
                  value={tipoPagamento}
                  onChange={(e) => setTipoPagamento(e.target.value)}
                  disabled={isVendaColaborador}
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              {/* Venda para colaborador */}
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isVendaColaborador}
                  onChange={(e) => {
                    setIsVendaColaborador(e.target.checked);
                    if (e.target.checked) setTipoPagamento('débito corporativo');
                  }}
                />
                <label className="form-check-label">Venda para colaborador</label>
              </div>

              {isVendaColaborador && (
                <div className="mb-3">
                  <label className="form-label">Selecionar Colaborador</label>
                  <select
                    className="form-select"
                    value={colaboradorSelecionado}
                    onChange={(e) => setColaboradorSelecionado(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {colaboradores.map(colab => (
                      <option key={colab._id} value={colab._id}>
                        {colab.name} - {colab.department} (Saldo: R$ {colab.availableBalance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Itens da Venda */}
              <div className="mb-3">
                <h6>Itens da Venda</h6>
                {itensVenda.length === 0 ? (
                  <p className="text-muted">Nenhum item adicionado</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Qtd</th>
                          <th>Preço</th>
                          <th>Subtotal</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensVenda.map(item => (
                          <tr key={item.id || item._id}>
                            <td>{item.nome || item.name}</td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                className="form-control form-control-sm"
                                style={{ width: '60px' }}
                                value={item.quantidade}
                                onChange={(e) => atualizarQuantidade(item.id || item._id, parseInt(e.target.value))}
                              />
                            </td>
                            <td>R$ {(item.preco || item.price || 0).toFixed(2)}</td>
                            <td>R$ {item.subtotal.toFixed(2)}</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => removerItem(item.id || item._id)}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mb-3">
                <h4>Total: R$ {calcularTotal().toFixed(2)}</h4>
              </div>

              {/* Botões */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success"
                  onClick={finalizarVenda}
                  disabled={itensVenda.length === 0}
                >
                  Finalizar Venda
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setItensVenda([]);
                    setIsVendaColaborador(false);
                    setColaboradorSelecionado('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendas;