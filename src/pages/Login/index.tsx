// src/pages/Login/index.tsx
import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// ─── Schema & Types ───────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(1, 'Digite sua senha'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CUSTOM_INPUT_STYLE = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' },
};

const CURRENT_YEAR = new Date().getFullYear();

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoginHeader() {
  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <img src="/logo.png" alt="Flugo" height="35" />
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: '#1E293B' }}>
        Acessar Painel
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: '#94A3B8', fontWeight: 500 }}>
        Sistema de Gestão Corporativa
      </Typography>
    </Box>
  );
}

function SecurityBadge() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 3 }}>
      <LockOutlinedIcon sx={{ fontSize: 13, color: '#CBD5E1' }} />
      <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 500, letterSpacing: '0.02em' }}>
        Acesso restrito · Dados protegidos por LGPD
      </Typography>
    </Box>
  );
}

function LoginFooter() {
  return (
    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#CBD5E1', mt: 4 }}>
      © {CURRENT_YEAR} Flugo · Todos os direitos reservados
    </Typography>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setAuthError('E-mail ou senha inválidos.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{ p: 4, width: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.06)' }}
        >
          <LoginHeader />

          {authError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontSize: '14px' }}>
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                autoComplete="email"
                InputLabelProps={{ shrink: true }}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={CUSTOM_INPUT_STYLE}
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                autoComplete="current-password"
                InputLabelProps={{ shrink: true }}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={CUSTOM_INPUT_STYLE}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              disableElevation
              sx={{
                mt: 3,
                py: 1.3,
                bgcolor: '#20C975',
                '&:hover': { bgcolor: '#1BA862' },
                '&:disabled': { bgcolor: '#A7F3D0' },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '15px',
                borderRadius: '8px',
              }}
            >
              {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Entrar'}
            </Button>
          </form>

          <SecurityBadge />
        </Paper>

        <LoginFooter />
      </Box>
    </Container>
  );
}