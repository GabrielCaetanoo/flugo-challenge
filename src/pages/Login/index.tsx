import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, Alert } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); 
    } catch (err) {
      console.error(err); 
    setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, width: '100%', border: '1px solid #E0E0E0', borderRadius: 3 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img src="/logo.png" alt="Flugo" height="35" />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: '#334155' }}>
              Acessar Painel
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="E-mail"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ 
                mt: 3, 
                py: 1.2, 
                bgcolor: '#2eaf7d', 
                '&:hover': { bgcolor: '#26966b' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Entrar
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}