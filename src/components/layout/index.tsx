import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, IconButton, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business'; // Novo ícone para Departamentos
import LogoutIcon from '@mui/icons-material/Logout'; // Ícone de Sair
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 260;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Pegando o usuário e a função de logout

  const isColaboradoresActive = location.pathname === '/' || location.pathname === '/novo';
  const isDepartamentosActive = location.pathname.startsWith('/departamentos');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px dashed #E0E0E0', bgcolor: '#FFFFFF' }
        }}
      >
        <Box sx={{ px: 5, pt: 4, pb: 2, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo Flugo" height="28" />
        </Box>

        <List sx={{ px: 2 }}>
          {/* Menu Colaboradores */}
          <ListItem disablePadding>
            <ListItemButton
              selected={isColaboradoresActive}
              onClick={() => navigate('/')}
              disableRipple
              sx={{
                borderRadius: 2, py: 1, mb: 1,
                '&.Mui-selected': { bgcolor: '#F8FAFC' },
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ bgcolor: isColaboradoresActive ? '#2eaf7d' : '#d2d7d8', p: '1px', borderRadius: '4px', display: 'flex' }}>
                  <PersonIcon sx={{ fontSize: '18px', color: isColaboradoresActive ? '#FFFFFF' : '#6e7c8c' }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="Colaboradores"
                sx={{ m: 0, '& .MuiTypography-root': { color: '#6e7c8c', fontWeight: 500, fontSize: '13.5px' } }}
              />
              <KeyboardArrowRightIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
            </ListItemButton>
          </ListItem>

          {/* NOVO: Menu Departamentos */}
          <ListItem disablePadding>
            <ListItemButton
              selected={isDepartamentosActive}
              onClick={() => navigate('/departamentos')}
              disableRipple
              sx={{
                borderRadius: 2, py: 1,
                '&.Mui-selected': { bgcolor: '#F8FAFC' },
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ bgcolor: isDepartamentosActive ? '#2eaf7d' : '#d2d7d8', p: '1px', borderRadius: '4px', display: 'flex' }}>
                  <BusinessIcon sx={{ fontSize: '18px', color: isDepartamentosActive ? '#FFFFFF' : '#6e7c8c' }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="Departamentos"
                sx={{ m: 0, '& .MuiTypography-root': { color: '#6e7c8c', fontWeight: 500, fontSize: '13.5px' } }}
              />
              <KeyboardArrowRightIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, width: '100%', gap: 2 }}>
          {/* Avatar dinâmico usando o e-mail do Firebase para o seed */}
          <Avatar
            src={`https://api.dicebear.com/9.x/personas/svg?seed=${user?.email || 'guest'}&backgroundColor=e5e7eb&radius=50`}
            alt="Usuário Logado"
            sx={{ width: 40, height: 40, bgcolor: '#E5E7EB' }}
          />
          
          {/* Botão de Logout para segurança */}
          <Tooltip title="Sair do sistema">
            <IconButton onClick={handleLogout} sx={{ color: '#6e7c8c' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
}