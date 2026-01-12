import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RepairList } from './pages/repairs/RepairList';
import { RepairCreate } from './pages/repairs/RepairCreate';
import { RepairDetail } from './pages/repairs/RepairDetail';
import { RepairEdit } from './pages/repairs/RepairEdit';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repairs"
          element={
            <ProtectedRoute>
              <RepairList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repairs/create"
          element={
            <ProtectedRoute>
              <RepairCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repairs/:id"
          element={
            <ProtectedRoute>
              <RepairDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repairs/:id/edit"
          element={
            <ProtectedRoute>
              <RepairEdit />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;