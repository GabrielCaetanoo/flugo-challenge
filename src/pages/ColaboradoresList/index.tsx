import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getEmployees, type EmployeeData } from '../../services/employeeService';

type EmployeeWithId = EmployeeData & { id: string };

const tableHeaderStyle = { color: '#64748B', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #F1F5F9', py: 2 };
const tableCellStyle = { color: '#475569', fontSize: '14px', borderBottom: '1px solid #E2E8F0', py: 2 };

export default function ColaboradoresList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '22px' }}>
          Colaboradores
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate('/novo')}
          disableElevation
          sx={{
            bgcolor: '#20C975', color: '#FFFFFF', fontWeight: 600, px: 3, py: 1, borderRadius: '8px',
            textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#1BA862' }
          }}
        >
          Novo Colaborador
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={tableHeaderStyle}>Nome ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Email ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Departamento ↓</TableCell>
              <TableCell align="right" sx={tableHeaderStyle}>Status ↓</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress sx={{ color: '#20C975' }} />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>
                  Nenhum colaborador cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' } }}
                >
                  <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={`https://api.dicebear.com/9.x/personas/svg?seed=${employee.id}&backgroundColor=e5e7eb&radius=50`}
                        alt={employee.name}
                        sx={{ width: 40, height: 40, bgcolor: '#E5E7EB' }}
                      >
                        {employee.name?.[0]}
                      </Avatar>

                      <Typography variant="body2" sx={{ fontWeight: 450, color: '#475569', fontSize: '14px' }}>
                        {employee.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={tableCellStyle}>{employee.email}</TableCell>
                  <TableCell sx={tableCellStyle}>{employee.department}</TableCell>
                  
                  <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                    <Chip
                      label={employee.isActive ? 'Ativo' : 'Inativo'}
                      sx={{
                        bgcolor: employee.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: employee.isActive ? '#166534' : '#991B1B',
                        fontWeight: 600, fontSize: '12px', height: '26px', borderRadius: '6px',
                        '& .MuiChip-label': { px: 1.5 }
                      }}
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