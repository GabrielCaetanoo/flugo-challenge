import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
          textAlign: 'center'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#2eaf7d', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
          404 - Página não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#64748b' }}>
          Ops! Parece que o caminho que você tentou acessar não existe ou foi removido.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ 
            bgcolor: '#2eaf7d', 
            '&:hover': { bgcolor: '#26966b' },
            textTransform: 'none',
            px: 4
          }}
        >
          Voltar para o Início
        </Button>
      </Box>
    </Container>
  );
}