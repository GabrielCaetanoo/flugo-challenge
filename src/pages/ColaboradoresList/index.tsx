import { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Avatar, CircularProgress, 
  TextField, MenuItem, Checkbox, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { getEmployees, deleteEmployee, deleteMultipleEmployees, type EmployeeData } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';

type EmployeeWithId = EmployeeData & { id: string };
interface DepartamentoLista { id: string; name: string; }

const tableHeaderStyle = { color: '#64748B', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #F1F5F9', py: 2 };
const tableCellStyle = { color: '#475569', fontSize: '14px', borderBottom: '1px solid #E2E8F0', py: 2 };

const formatCurrency = (value: string | number | undefined) => {
  if (!value) return 'Não informado';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Não informada';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function ColaboradoresList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<EmployeeWithId | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
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

  async function fetchDepartments() {
    try {
      const data = await getDepartments();
      setDepartamentos(data.map(d => ({ id: d.id, name: d.name })));
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = filterDepartment ? emp.department === filterDepartment : true;
    return matchesSearch && matchesDept;
  });

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredEmployees.map((n) => n.id));
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
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleDeleteIndividual = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error(error); 
        alert("Erro ao excluir o colaborador.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selected.length} colaboradores?`)) {
      try {
        await deleteMultipleEmployees(selected);
        setSelected([]);
        fetchEmployees();
      } catch (error) {
        console.error(error); 
        alert("Erro ao excluir colaboradores em massa.");
      }
    }
  };

  const handleViewProfile = (emp: EmployeeWithId) => {
    setEmployeeToView(emp);
    setViewModalOpen(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '22px' }}>
          Colaboradores
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selected.length > 0 && (
            <Button variant="outlined" color="error" onClick={handleBulkDelete} startIcon={<DeleteIcon />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
              Excluir Selecionados ({selected.length})
            </Button>
          )}
          <Button variant="contained" onClick={() => navigate('/novo')} disableElevation sx={{ bgcolor: '#20C975', color: '#FFFFFF', fontWeight: 600, px: 3, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#1BA862' } }}>
            Novo Colaborador
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Buscar por nome ou e-mail..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} /> }} sx={{ width: 300, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
        <TextField select size="small" label="Departamento" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} sx={{ width: 200, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} SelectProps={{ MenuProps: { disableScrollLock: true } }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="A definir"><em>A definir / Diretoria</em></MenuItem>
          {departamentos.map((dep) => (
            <MenuItem key={dep.id} value={dep.name}>{dep.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell padding="checkbox" sx={tableHeaderStyle}>
                <Checkbox color="primary" indeterminate={selected.length > 0 && selected.length < filteredEmployees.length} checked={filteredEmployees.length > 0 && selected.length === filteredEmployees.length} onChange={handleSelectAllClick} sx={{ '&.Mui-checked': { color: '#20C975' } }} />
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
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}><CircularProgress sx={{ color: '#20C975' }} /></TableCell></TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>Nenhum colaborador encontrado.</TableCell></TableRow>
            ) : (
              filteredEmployees.map((employee) => {
                const isItemSelected = isSelected(employee.id);
                return (
                  <TableRow key={employee.id} hover sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' }, cursor: 'pointer' }}>
                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E2E8F0' }}>
                      <Checkbox color="primary" checked={isItemSelected} onClick={() => handleClick(employee.id)} sx={{ '&.Mui-checked': { color: '#20C975' } }} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={`https://api.dicebear.com/9.x/personas/svg?seed=${employee.id}&backgroundColor=e5e7eb&radius=50`} sx={{ width: 40, height: 40, bgcolor: '#E5E7EB' }}>{employee.name?.[0]}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 450, color: '#475569', fontSize: '14px' }}>{employee.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={tableCellStyle}>{employee.email}</TableCell>
                    <TableCell sx={tableCellStyle}>{employee.department}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                      <Chip label={employee.isActive ? 'Ativo' : 'Inativo'} sx={{ bgcolor: employee.isActive ? '#DCFCE7' : '#FEE2E2', color: employee.isActive ? '#166534' : '#991B1B', fontWeight: 600, fontSize: '12px', height: '26px', borderRadius: '6px' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                      <Tooltip title="Visualizar Perfil">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewProfile(employee); }} sx={{ color: '#94A3B8', '&:hover': { color: '#20C975' } }}><VisibilityIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/editar/${employee.id}`); }} sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteIndividual(employee.id); }} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL CORRIGIDO: Sem o componente Grid bugado */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth disableScrollLock PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ pb: 0, pt: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={`https://api.dicebear.com/9.x/personas/svg?seed=${employeeToView?.id}&backgroundColor=e5e7eb&radius=50`} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{employeeToView?.name}</Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>{employeeToView?.email}</Typography>
            </Box>
            <Chip label={employeeToView?.isActive ? 'Ativo' : 'Inativo'} size="small" sx={{ ml: 'auto', bgcolor: employeeToView?.isActive ? '#DCFCE7' : '#FEE2E2', color: employeeToView?.isActive ? '#166534' : '#991B1B', fontWeight: 600 }} />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 4, pt: 3 }}>
          <Divider sx={{ mb: 3 }} />
          
          {/* USANDO BOX COM CSS GRID NO LUGAR DO GRID DO MUI */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: 'span 6' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Departamento</Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>{employeeToView?.department || 'Não informado'}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 6' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Cargo</Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>{employeeToView?.cargo || 'Não informado'}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 6' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Nível</Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>{employeeToView?.nivel || 'Não informado'}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 6' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Data de Admissão</Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>{formatDate(employeeToView?.dataAdmissao)}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', mt: 1, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Salário Base</Typography>
                <Typography variant="h6" sx={{ color: '#20C975', fontWeight: 700, mt: 0.5 }}>
                  {formatCurrency(employeeToView?.salario)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}