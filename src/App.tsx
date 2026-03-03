// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/index';
import ColaboradoresList from './pages/ColaboradoresList';
import NovoColaborador from './pages/NovoColaborador';
import EditarColaborador from './pages/EditarColaborador'; 
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

const DepartamentosPlaceholder = () => <div>Página de Departamentos em construção...</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ColaboradoresList />} />
          <Route path="/novo" element={<NovoColaborador />} /> 
          
          <Route path="/editar/:id" element={<EditarColaborador />} /> 
          
          <Route path="/departamentos" element={<DepartamentosPlaceholder />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}