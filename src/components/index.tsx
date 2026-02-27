// src/components/Layout/index.tsx
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar,  } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260; // Largura do menu lateral

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se o menu "Colaboradores" deve ficar destacado
  const isColaboradoresActive = location.pathname === '/' || location.pathname === '/novo';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      
{/* 1. Menu Lateral (Sidebar) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            // Tracejado bem fino (1px) e cinza claro, igual ao Figma
            borderRight: '1px dashed #E0E0E0', 
            bgcolor: '#FFFFFF',
          },
        }}
      >
        {/* Logo Flugo */}
        {/* Reduzimos o padding inferior (pb) para aproximar o botão de baixo */}
        <Box sx={{ px: 5, pt: 4, pb: -1, display: 'flex', alignItems: 'center' }}>
          {/* Logo menor e mais delicada (height 28) */}
          <img src="/logo.png" alt="Logo Flugo" height="28" />
        </Box>

         {/* Lista de Menus */}
        <List sx={{ px: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              selected={isColaboradoresActive}
              onClick={() => navigate('/')}
              disableRipple 
              sx={{ 
                borderRadius: 2,
                py: 1, // Deixa o botão um pouco mais "fino" na altura
                '&.Mui-selected': { bgcolor: 'transparent' },
                '&.Mui-selected:hover': { bgcolor: '#F8FAFC' },
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
            >
              {/* minWidth reduzido para 40 para aproximar o texto do ícone */}
              <ListItemIcon sx={{ minWidth: 40 }}> 
                <Box sx={{ bgcolor: '#E2E8F0', p: '3px', borderRadius: '8px', display: 'flex' }}>
                  {/* Ícone menor (18px) para ficar mais elegante */}
                  <PersonIcon sx={{ fontSize: '18px', color: '#64748B' }} />
                </Box>
              </ListItemIcon>
              
              <ListItemText 
                primary="Colaboradores" 
                sx={{ 
                  m: 0, // Remove margens extras
                  '& .MuiTypography-root': { 
                    color: '#a2a8b3', 
                    fontWeight: 600,
                    fontSize: '14.5px', // Fonte reduzida para ficar idêntica ao Figma
                    letterSpacing: '-0.2px' // Deixa as letras sutilmente mais juntas
                  } 
                }} 
              />
              
              {/* Setinha sutilmente menor também */}
              <KeyboardArrowRightIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />

            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* 2. Área Principal de Conteúdo */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        
        {/* Cabeçalho com o Avatar no canto direito */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          {/* Usando uma imagem genérica para o avatar por enquanto */}
          <Avatar alt="Usuário Logado" src="https://i.pravatar.cc/150?img=11" />
        </Box>

        {/* É aqui que as páginas "Lista" ou "Formulário" vão aparecer! */}
        <Outlet />
      </Box>
      
    </Box>
  );
}