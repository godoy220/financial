import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando categorias...</div>;
  }

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="dashboard">
      <h1>Categorias</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Categorias de Receita */}
        <div>
          <h2 style={{ color: '#10b981', marginBottom: '20px' }}>Receitas</h2>
          <div className="categories-list">
            {incomeCategories.length === 0 ? (
              <p>Nenhuma categoria de receita</p>
            ) : (
              incomeCategories.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <span className="name">{category.name}</span>
                  </div>
                  <div className="category-meta">
                    <span 
                      className="color-badge"
                      style={{
                        backgroundColor: category.color,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}
                    ></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categorias de Despesa */}
        <div>
          <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>Despesas</h2>
          <div className="categories-list">
            {expenseCategories.length === 0 ? (
              <p>Nenhuma categoria de despesa</p>
            ) : (
              expenseCategories.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <span className="name">{category.name}</span>
                  </div>
                  <div className="category-meta">
                    <span 
                      className="color-badge"
                      style={{
                        backgroundColor: category.color,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'inline-block'
                      }}
                    ></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;