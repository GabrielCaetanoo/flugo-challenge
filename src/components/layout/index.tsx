// src/components/layout/index.tsx
import { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, IconButton, Tooltip, Menu, MenuItem, Divider, Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

import { useAuth } from '../../hooks/useAuth';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Colaboradores', path: '/', icon: <PersonIcon />, matchPaths: ['/', '/novo', '/editar'] },
  { label: 'Departamentos', path: '/departamentos', icon: <BusinessIcon />, matchPaths: ['/departamentos'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarUrl = (seed: string): string =>
  `https://api.dicebear.com/9.x/personas/svg?seed=${seed}&backgroundColor=e5e7eb&radius=50`;

const isPathActive = (pathname: string, matchPaths: string[]): boolean =>
  matchPaths.some((p) => (p === '/' ? pathname === p : pathname.startsWith(p)));

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavItemProps {
  label: string;
  path: string;
  icon: React.ReactElement;
  matchPaths: string[];
  pathname: string;
  onNavigate: (path: string) => void;
}

function NavItem({ label, path, icon, matchPaths, pathname, onNavigate }: NavItemProps) {
  const active = isPathActive(pathname, matchPaths);

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={active}
        onClick={() => onNavigate(path)}
        disableRipple
        sx={{
          borderRadius: 2, py: 1, mb: 1,
          '&.Mui-selected': { bgcolor: '#F8FAFC' },
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Box sx={{ bgcolor: active ? '#20C975' : '#d2d7d8', p: '1px', borderRadius: '4px', display: 'flex' }}>
            {React.cloneElement(icon as React.ReactElement<{ sx?: SxProps<Theme> }>, {
              sx: { fontSize: '18px', color: active ? '#FFFFFF' : '#6e7c8c' },
            })}
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={label}
          sx={{ m: 0, '& .MuiTypography-root': { color: '#6e7c8c', fontWeight: 500, fontSize: '13.5px' } }}
        />
        <KeyboardArrowRightIcon sx={{ color: '#94A3B8', fontSize: '20px' }} />
      </ListItemButton>
    </ListItem>
  );
}

interface UserMenuProps {
  email: string | null | undefined;
  displayName: string | null | undefined;
  onLogout: () => void;
}

function UserMenu({ email, displayName, onLogout }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Minha Conta">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar
            src={getAvatarUrl(email || 'guest')}
            sx={{ width: 40, height: 40, border: '2px solid #F1F5F9' }}
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableScrollLock
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5, borderRadius: '12px', minWidth: 200,
            '&:before': {
              content: '""', display: 'block', position: 'absolute',
              top: 0, right: 14, width: 10, height: 10,
              bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {displayName || 'Administrador'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>{email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={onLogout} sx={{ fontSize: '14px', color: '#EF4444', py: 1 }}>
          <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
          Sair do Sistema
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao efetuar logout:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px dashed #E0E0E0' },
        }}
      >
        <Box sx={{ px: 5, pt: 4, pb: 2 }}>
          <img src="/logo.png" alt="Logo Flugo" height="28" />
        </Box>

        <List sx={{ px: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              pathname={pathname}
              onNavigate={navigate}
            />
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <UserMenu
            email={user?.email}
            displayName={user?.displayName}
            onLogout={handleLogout}
          />
        </Box>

        <Outlet />
      </Box>
    </Box>
  );
}