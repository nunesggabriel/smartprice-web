import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';

import Login from '../pages/Login';
import Produtos from '../pages/Produtos';
import Insumos from '../pages/Insumos';
import Despesas from '../pages/Despesas';
import Impostos from '../pages/Impostos';
import Configuracao from '../pages/Configuracao';
import Simulacao from '../pages/Simulacao';
import Cadastro from '../pages/Cadastro';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  return isAuthenticated() ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/produtos"    element={<PrivateRoute><Produtos /></PrivateRoute>} />
        <Route path="/insumos"     element={<PrivateRoute><Insumos /></PrivateRoute>} />
        <Route path="/despesas"    element={<PrivateRoute><Despesas /></PrivateRoute>} />
        <Route path="/impostos"    element={<PrivateRoute><Impostos /></PrivateRoute>} />
        <Route path="/configuracao" element={<PrivateRoute><Configuracao /></PrivateRoute>} />
        <Route path="/simulacao"   element={<PrivateRoute><Simulacao /></PrivateRoute>} />
        <Route path="/cadastro" element={<Cadastro />} />
        

        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/produtos" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;