// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/index';
import ColaboradoresList from './pages/ColaboradoresList';
import NovoColaborador from './pages/NovoColaborador';
import EditarColaborador from './pages/EditarColaborador'; 
import DepartamentosList from './pages/DepartamentosList'; // NOVO IMPORT
import EditarDepartamento from './pages/EditarDepartamento';
import NovoDepartamento from './pages/NovoDepartamento';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/layout/ProtectedRoute';


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
          {/* Rotas de Colaboradores */}
          <Route path="/" element={<ColaboradoresList />} />
          <Route path="/novo" element={<NovoColaborador />} /> 
          <Route path="/editar/:id" element={<EditarColaborador />} /> 
          
          {/* Rotas de Departamentos */}
          <Route path="/departamentos" element={<DepartamentosList />} />
          <Route path="/departamentos/novo" element={<NovoDepartamento />} />
          <Route path="/departamentos/editar/:id" element={<EditarDepartamento />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}