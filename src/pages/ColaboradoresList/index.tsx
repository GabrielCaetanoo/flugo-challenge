// src/pages/ColaboradoresList/index.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getEmployees, type EmployeeData } from '../../services/employeeService';

// Tipagem local para incluir o ID do banco
type EmployeeWithId = EmployeeData & { id: string };

export default function ColaboradoresList() {
  const navigate = useNavigate();
  // Estados para controlar os dados e o carregamento
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os dados no Firebase quando a tela carrega
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      } finally {
        setLoading(false); // Tira o loading indepedente de dar erro ou sucesso
      }
    }
    fetchEmployees();
  }, []);

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#212121">
          Colaboradores
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/novo')}
          sx={{ fontWeight: 'bold', px: 3, py: 1, boxShadow: 'none' }}
        >
          Novo Colaborador
        </Button>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ color: '#757575', fontWeight: 600 }}>Nome ↓</TableCell>
              <TableCell sx={{ color: '#757575', fontWeight: 600 }}>Email ↓</TableCell>
              <TableCell sx={{ color: '#757575', fontWeight: 600 }}>Departamento ↓</TableCell>
              <TableCell align="right" sx={{ color: '#757575', fontWeight: 600 }}>Status ↓</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Renderização Condicional: Loading, Vazio ou Lista */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#757575' }}>
                  Nenhum colaborador cadastrado ainda. Clique em "Novo Colaborador" para começar.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee, index) => (
                <TableRow key={employee.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Usando o index para gerar um avatar de placeholder diferente para cada um */}
                      <Avatar src={`https://i.pravatar.cc/150?img=${index + 1}`} alt={employee.name} sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2" fontWeight={500}>{employee.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#424242' }}>{employee.email}</TableCell>
                  <TableCell sx={{ color: '#424242' }}>{employee.department}</TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={employee.isActive ? 'Ativo' : 'Inativo'} 
                      sx={{ 
                        bgcolor: employee.isActive ? '#E8F5E9' : '#FFEBEE', 
                        color: employee.isActive ? '#2E7D32' : '#C62828',
                        fontWeight: 'bold',
                        borderRadius: 1
                      }} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}