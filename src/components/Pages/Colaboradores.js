// src/components/Pages/Colaboradores.js
import React, { useState, useEffect } from 'react';

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState(null);
  const [showSenha, setShowSenha] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    setor: 'TI',
    valorMaximo: '',
    saldoDisponivel: '',
    login: '',
    senha: ''
  });

  // Setores disponíveis
  const setores = ['TI', 'RH', 'Vendas', 'Financeiro', 'Marketing', 'Produção', 'Administrativo', 'Outros'];

  useEffect(() => {
    // Carregar colaboradores do localStorage apenas uma vez
    const colaboradoresSalvos = localStorage.getItem('cafeteria_colaboradores');
    if (colaboradoresSalvos) {
      setColaboradores(JSON.parse(colaboradoresSalvos));
    }
  }, []);

  // Salvar colaboradores no localStorage sempre que houver mudanças
  useEffect(() => {
    if (colaboradores.length > 0) {
      localStorage.setItem('cafeteria_colaboradores', JSON.stringify(colaboradores));
    }
  }, [colaboradores]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const gerarCredenciais = (nome) => {
    // Gerar login a partir do nome (primeiro.nome)
    const nomeFormatado = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const partesNome = nomeFormatado.split(' ');
    const login = partesNome.length >= 2 
      ? `${partesNome[0]}.${partesNome[partesNome.length - 1]}` 
      : partesNome[0];
    
    // Gerar senha aleatória de 6 dígitos
    const senha = Math.floor(100000 + Math.random() * 900000).toString();
    
    return { login, senha };
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      alert('Nome do colaborador é obrigatório!');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Email válido é obrigatório!');
      return false;
    }
    if (!formData.valorMaximo || parseFloat(formData.valorMaximo) <= 0) {
      alert('Valor máximo deve ser maior que zero!');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    let credenciais = { login: formData.login, senha: formData.senha };

    // Gerar credenciais automaticamente se for novo colaborador
    if (!modoEdicao && (!formData.login || !formData.senha)) {
      credenciais = gerarCredenciais(formData.nome);
    }

    const colaborador = {
      id: modoEdicao ? colaboradorEditando.id : Date.now(),
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      setor: formData.setor,
      valorMaximo: parseFloat(formData.valorMaximo),
      saldoDisponivel: modoEdicao 
        ? parseFloat(formData.saldoDisponivel || colaboradorEditando.saldoDisponivel)
        : parseFloat(formData.valorMaximo), // Saldo inicial = valor máximo
      login: credenciais.login,
      senha: credenciais.senha,
      dataCriacao: modoEdicao ? colaboradorEditando.dataCriacao : new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };

    if (modoEdicao) {
      // Editar colaborador
      setColaboradores(colaboradores.map(c => c.id === colaboradorEditando.id ? colaborador : c));
      alert('Colaborador atualizado com sucesso!');
    } else {
      // Adicionar novo colaborador
      setColaboradores(prevColaboradores => [...prevColaboradores, colaborador]);
      alert(`Colaborador cadastrado com sucesso!\nLogin: ${credenciais.login}\nSenha: ${credenciais.senha}`);
    }

    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      setor: 'TI',
      valorMaximo: '',
      saldoDisponivel: '',
      login: '',
      senha: ''
    });
    setModoEdicao(false);
    setColaboradorEditando(null);
    setShowSenha(false);
  };

  const editarColaborador = (colaborador) => {
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email,
      setor: colaborador.setor,
      valorMaximo: colaborador.valorMaximo.toString(),
      saldoDisponivel: colaborador.saldoDisponivel.toString(),
      login: colaborador.login,
      senha: colaborador.senha
    });
    setColaboradorEditando(colaborador);
    setModoEdicao(true);
  };

  const excluirColaborador = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      setColaboradores(colaboradores.filter(c => c.id !== id));
      alert('Colaborador excluído com sucesso!');
    }
  };

  const redefinirSenha = (colaborador) => {
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
    const colaboradorAtualizado = {
      ...colaborador,
      senha: novaSenha,
      dataAtualizacao: new Date().toISOString()
    };
    
    setColaboradores(colaboradores.map(c => c.id === colaborador.id ? colaboradorAtualizado : c));
    alert(`Senha redefinida com sucesso!\nNova senha: ${novaSenha}`);
  };

  const copiarCredenciais = (colaborador) => {
    const texto = `Login: ${colaborador.login}\nSenha: ${colaborador.senha}`;
    navigator.clipboard.writeText(texto);
    alert('Credenciais copiadas para a área de transferência!');
  };

  const exportarColaboradores = () => {
    const csvContent = [
      ['ID', 'Nome', 'Email', 'Setor', 'Valor Máximo', 'Saldo Disponível', 'Login', 'Senha'],
      ...colaboradores.map(colab => [
        colab.id,
        colab.nome,
        colab.email,
        colab.setor,
        `R$ ${colab.valorMaximo.toFixed(2)}`,
        `R$ ${colab.saldoDisponivel.toFixed(2)}`,
        colab.login,
        colab.senha
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `colaboradores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container-fluid">
      <h2>Gerenciar Colaboradores</h2>

      <div className="row">
        {/* Formulário */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>{modoEdicao ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome Completo *</label>
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
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Setor *</label>
                  <select
                    className="form-select"
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    required
                  >
                    {setores.map(setor => (
                      <option key={setor} value={setor}>{setor}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Valor Máximo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    name="valorMaximo"
                    value={formData.valorMaximo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {modoEdicao && (
                  <div className="mb-3">
                    <label className="form-label">Saldo Disponível (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      name="saldoDisponivel"
                      value={formData.saldoDisponivel}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Login de Acesso</label>
                  <input
                    type="text"
                    className="form-control"
                    name="login"
                    value={formData.login}
                    onChange={handleInputChange}
                    placeholder="Será gerado automaticamente se vazio"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Senha</label>
                  <div className="input-group">
                    <input
                      type={showSenha ? "text" : "password"}
                      className="form-control"
                      name="senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      placeholder="Será gerada automaticamente se vazio"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowSenha(!showSenha)}
                    >
                      {showSenha ? '👁️' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    {modoEdicao ? 'Atualizar Colaborador' : 'Cadastrar Colaborador'}
                  </button>
                  {modoEdicao && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setFormData({
                          nome: '',
                          email: '',
                          setor: 'TI',
                          valorMaximo: '',
                          saldoDisponivel: '',
                          login: '',
                          senha: ''
                        });
                        setModoEdicao(false);
                        setColaboradorEditando(null);
                      }}
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Lista de Colaboradores */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Lista de Colaboradores ({colaboradores.length})</h5>
              <button className="btn btn-success btn-sm" onClick={exportarColaboradores}>
                📊 Exportar CSV
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Setor</th>
                      <th>Valor Máximo</th>
                      <th>Saldo Disponível</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradores.map(colab => (
                      <tr key={colab.id}>
                        <td>{colab.id}</td>
                        <td>
                          <strong>{colab.nome}</strong>
                          <br />
                          <small className="text-muted">{colab.email}</small>
                        </td>
                        <td>
                          <span className="badge bg-info">{colab.setor}</span>
                        </td>
                        <td>R$ {colab.valorMaximo.toFixed(2)}</td>
                        <td>
                          <span className={
                            colab.saldoDisponivel === colab.valorMaximo 
                              ? 'text-success' 
                              : 'text-warning'
                          }>
                            <strong>R$ {colab.saldoDisponivel.toFixed(2)}</strong>
                          </span>
                        </td>
                        <td>
                          {colab.saldoDisponivel === 0 ? (
                            <span className="badge bg-danger">Sem Saldo</span>
                          ) : colab.saldoDisponivel < colab.valorMaximo * 0.3 ? (
                            <span className="badge bg-warning">Saldo Baixo</span>
                          ) : (
                            <span className="badge bg-success">Disponível</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => editarColaborador(colab)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => copiarCredenciais(colab)}
                              title="Copiar Credenciais"
                            >
                              📋
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => redefinirSenha(colab)}
                              title="Redefinir Senha"
                            >
                              🔄
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => excluirColaborador(colab.id)}
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

              {colaboradores.length === 0 && (
                <div className="text-center text-muted py-4">
                  <p>Nenhum colaborador cadastrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Colaboradores;