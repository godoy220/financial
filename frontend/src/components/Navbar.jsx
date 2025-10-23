import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          💰 Finanças Pessoais
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/transactions" className={isActive('/transactions') ? 'active' : ''}>
              Transações
            </Link>
          </li>
          <li>
            <Link to="/categories" className={isActive('/categories') ? 'active' : ''}>
              Categorias
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <span className="user-info">Olá, {user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;