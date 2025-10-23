import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        axios.get('/api/transactions/summary'),
        axios.get('/api/transactions?limit=5')
      ]);

      setSummary(summaryRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard Financeiro</h1>
      
      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Receitas</h3>
          <p className="amount">R$ {summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Despesas</h3>
          <p className="amount">R$ {summary.totalExpense.toFixed(2)}</p>
        </div>
        <div className={`summary-card balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
          <h3>Saldo</h3>
          <p className="amount">R$ {summary.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Transações Recentes</h2>
        {recentTransactions.length === 0 ? (
          <p>Nenhuma transação encontrada</p>
        ) : (
          <div className="transactions-list">
            {recentTransactions.map(transaction => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;