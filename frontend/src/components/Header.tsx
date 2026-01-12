import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get username from localStorage (simple solution)
  const username = localStorage.getItem('username') || 'User';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Repair System</h1>
      </div>
      <div className="header-right">
        <span className="header-username">{username}</span>
        <button className="header-logout-btn" onClick={handleLogout}>
                  Logout
        </button>
      </div>
    </header>
  );
};
