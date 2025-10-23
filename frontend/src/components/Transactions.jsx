import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        axios.get('/api/transactions?limit=50'),
        axios.get('/api/categories')
      ]);

      setTransactions(transactionsRes.data.transactions);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transactions', formData);
      setShowForm(false);
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        categoryId: ''
      });
      fetchData(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    }
  };

  if (loading) {
    return <div className="loading">Carregando transações...</div>;
  }

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Transações</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancelar' : 'Nova Transação'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Nova Transação</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Descrição:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Valor:</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>

            <div className="form-group">
              <label>Categoria:</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories
                  .filter(cat => cat.type === formData.type)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Data:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Salvar Transação
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="transactions-list">
        <h2>Histórico de Transações</h2>
        {transactions.length === 0 ? (
          <p>Nenhuma transação encontrada</p>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <span className="description">{transaction.description}</span>
                <span className={`amount ${transaction.type}`}>
                  R$ {parseFloat(transaction.amount).toFixed(2)}
                </span>
              </div>
              <div className="transaction-meta">
                <span className="category" style={{ color: transaction.Category?.color }}>
                  {transaction.Category?.name}
                </span>
                <span className="date">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;