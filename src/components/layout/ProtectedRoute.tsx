// src/components/layout/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import type { ReactNode } from 'react';

import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#20C975' }} />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};