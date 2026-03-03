import { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Avatar, CircularProgress, 
  TextField, MenuItem, Checkbox, IconButton, Tooltip 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { getEmployees, deleteEmployee, deleteMultipleEmployees, type EmployeeData } from '../../services/employeeService';

type EmployeeWithId = EmployeeData & { id: string };

const tableHeaderStyle = { color: '#64748B', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #F1F5F9', py: 2 };
const tableCellStyle = { color: '#475569', fontSize: '14px', borderBottom: '1px solid #E2E8F0', py: 2 };

export default function ColaboradoresList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS DA PARTE 2: Filtros e Seleção
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    } finally {
      setLoading(false);
    }
  }

  // LÓGICA DE FILTRO
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDepartment ? emp.department === filterDepartment : true;

    return matchesSearch && matchesDept;
  });

  // LÓGICA DE SELEÇÃO EM MASSA
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredEmployees.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

    // LÓGICA DE EXCLUSÃO
  const handleDeleteIndividual = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees(); // Atualiza a tabela
      } catch (error) {
        console.error(error); // <-- Adicione esta linha
          alert("Erro ao excluir o colaborador.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selected.length} colaboradores?`)) {
      try {
        await deleteMultipleEmployees(selected);
        setSelected([]); // Limpa a seleção
        fetchEmployees(); // Atualiza a tabela
      } catch (error) {
        console.error(error); // <-- Adicione esta linha
          alert("Erro ao excluir colaboradores em massa.");
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* HEADER DA PÁGINA */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '22px' }}>
          Colaboradores
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {selected.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              startIcon={<DeleteIcon />}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Excluir Selecionados ({selected.length})
            </Button>
          )}
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
      </Box>

      {/* ÁREA DE FILTROS */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} /> }}
          sx={{ width: 300, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
        <TextField
          select
          size="small"
          label="Departamento"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          sx={{ width: 200, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }} // <-- Essa linha resolve o pulo da tela!
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="Design">Design</MenuItem>
          <MenuItem value="TI">TI</MenuItem>
          <MenuItem value="Marketing">Marketing</MenuItem>
          <MenuItem value="Produto">Produto</MenuItem>
        </TextField>
      </Box>

      {/* TABELA */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              {/* Checkbox Geral */}
              <TableCell padding="checkbox" sx={tableHeaderStyle}>
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < filteredEmployees.length}
                  checked={filteredEmployees.length > 0 && selected.length === filteredEmployees.length}
                  onChange={handleSelectAllClick}
                  sx={{ '&.Mui-checked': { color: '#20C975' } }}
                />
              </TableCell>
              <TableCell sx={tableHeaderStyle}>Nome ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Email ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Departamento ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Status ↓</TableCell>
              <TableCell align="right" sx={tableHeaderStyle}>Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <CircularProgress sx={{ color: '#20C975' }} />
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => {
                const isItemSelected = isSelected(employee.id);

                return (
                  <TableRow
                    key={employee.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' }, cursor: 'pointer' }}
                  >
                    {/* Checkbox Individual */}
                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E2E8F0' }}>
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={() => handleClick(employee.id)}
                        sx={{ '&.Mui-checked': { color: '#20C975' } }}
                      />
                    </TableCell>

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
                    
                    <TableCell sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
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

                    {/* Ações: Editar e Excluir */}
                    <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          onClick={(e) => { e.stopPropagation(); navigate(`/editar/${employee.id}`); }}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          size="small" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteIndividual(employee.id); }}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}