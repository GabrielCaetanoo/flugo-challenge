// src/pages/NotFound/index.tsx
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY_BUTTON_STYLE = {
  bgcolor: '#20C975',
  '&:hover': { bgcolor: '#1BA862' },
  textTransform: 'none',
  fontWeight: 600,
  px: 4,
  py: 1,
  borderRadius: '8px',
  fontSize: '15px',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#20C975', mb: 2 }} />

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1E293B' }}>
          404 — Página não encontrada
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: '#64748B' }}>
          Ops! O caminho que você tentou acessar não existe ou foi removido.
        </Typography>

        <Button
          variant="contained"
          disableElevation
          onClick={() => navigate('/')}
          sx={PRIMARY_BUTTON_STYLE}
        >
          Voltar para o Início
        </Button>
      </Box>
    </Container>
  );
}