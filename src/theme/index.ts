// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#20C975', // Um verde aproximado da marca Flugo pelo print
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Remove o uppercase padrão do Material UI nos botões
    },
  },
});