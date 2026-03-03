import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode; 
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Enquanto o Firebase verifica se existe um token JWT ativo...
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress sx={{ color: '#2eaf7d' }} />
      </Box>
    );
  }

  // Se não tiver usuário logado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza os filhos (o Layout e as páginas)
  return children;
};