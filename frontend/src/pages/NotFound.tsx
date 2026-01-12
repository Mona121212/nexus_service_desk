import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-title">404 - 页面不存在</h1>
        <p className="not-found-text">找不到您要访问的页面</p>
        <Link to="/" className="not-found-link">
          返回首页
        </Link>
      </div>
    </div>
  );
};
