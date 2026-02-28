import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

// TODO: Substituir por ID dinâmico vindo do contexto de Autenticação futuramente
const loggedUserSeed = 'usuario-logado';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isColaboradoresActive = location.pathname === '/' || location.pathname === '/novo';

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
          <ListItem disablePadding>
            <ListItemButton
              selected={isColaboradoresActive}
              onClick={() => navigate('/')}
              disableRipple
              sx={{
                borderRadius: 2, py: 1,
                '&.Mui-selected': { bgcolor: 'transparent' },
                '&.Mui-selected:hover': { bgcolor: '#F8FAFC' },
                '&:hover': { bgcolor: '#F8FAFC' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box sx={{ bgcolor: '#d2d7d8', p: '1px', borderRadius: '4px', display: 'flex' }}>
                  <PersonIcon sx={{ fontSize: '18px', color: '#6e7c8c' }} />
                </Box>
              </ListItemIcon>

              <ListItemText
                primary="Colaboradores"
                sx={{ m: 0, '& .MuiTypography-root': { color: '#6e7c8c', fontWeight: 500, fontSize: '13.5px', letterSpacing: '-0.2px' } }}
              />

              <KeyboardArrowRightIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, width: '100%' }}>
          <Avatar
            src={`https://api.dicebear.com/9.x/personas/svg?seed=${loggedUserSeed}&backgroundColor=e5e7eb&radius=50`}
            alt="Usuário Logado"
            sx={{ width: 40, height: 40, bgcolor: '#E5E7EB' }}
          >
            U
          </Avatar>
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
}