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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { getEmployees, deleteEmployee, deleteMultipleEmployees, type EmployeeData } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';

// ─── Types ───────────────────────────────────────────────────────────────────

type EmployeeWithId = EmployeeData & { id: string };

interface Department {
  id: string;
  name: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABLE_HEADER_STYLE = {
  color: '#64748B',
  fontWeight: 600,
  fontSize: '13px',
  borderBottom: '1px solid #F1F5F9',
  py: 2,
};

const TABLE_CELL_STYLE = {
  color: '#475569',
  fontSize: '14px',
  borderBottom: '1px solid #E2E8F0',
  py: 2,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: string | number | undefined): string => {
  if (!value) return 'Não informado';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
};

const formatCurrencyCompact = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Não informada';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const getAvatarUrl = (id: string): string =>
  `https://api.dicebear.com/9.x/personas/svg?seed=${id}&backgroundColor=e5e7eb&radius=50`;

// ─── Custom Hooks ────────────────────────────────────────────────────────────

function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeWithId[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, refetch: fetchEmployees };
}

function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data.map((d) => ({ id: d.id, name: d.name })));
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    fetchDepartments();
  }, []);

  return departments;
}

function useSelection(items: EmployeeWithId[]) {
  const [selected, setSelected] = useState<string[]>([]);

  const isSelected = (id: string) => selected.includes(id);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.checked ? items.map((item) => item.id) : []);
  };

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  return { selected, isSelected, handleSelectAll, handleToggle, clearSelection };
}

function useFilteredEmployees(employees: EmployeeWithId[], searchTerm: string, filterDepartment: string) {
  return employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment ? emp.department === filterDepartment : true;
    return matchesSearch && matchesDepartment;
  });
}

function usePayrollSummary(employees: EmployeeWithId[]) {
  const total = employees.length;
  const monthlyPayroll = employees.reduce((acc, emp) => acc + (Number(emp.salario) || 0), 0);
  const averageSalary = total > 0 ? monthlyPayroll / total : 0;
  return { total, monthlyPayroll, averageSalary };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface PayrollSummaryProps {
  total: number;
  monthlyPayroll: number;
  averageSalary: number;
  showValues: boolean;
  onToggleVisibility: () => void;
}

function PayrollSummary({ total, monthlyPayroll, averageSalary, showValues, onToggleVisibility }: PayrollSummaryProps) {
  const hiddenMask = 'R$ ••••••';

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', fontSize: '16px' }}>
          Resumo Financeiro
        </Typography>
        <Tooltip title={showValues ? 'Ocultar valores' : 'Mostrar valores'}>
          <IconButton size="small" onClick={onToggleVisibility} sx={{ color: '#94A3B8' }}>
            {showValues ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <SummaryCard label="Total Colaboradores" value={String(total)} valueColor="#1E293B" />
        <SummaryCard
          label="Folha de Pagamento"
          value={showValues ? formatCurrencyCompact(monthlyPayroll) : hiddenMask}
          valueColor="#20C975"
        />
        <SummaryCard
          label="Média Salarial"
          value={showValues ? formatCurrencyCompact(averageSalary) : hiddenMask}
          valueColor="#3B82F6"
        />
      </Box>
    </>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  valueColor: string;
}

function SummaryCard({ label, value, valueColor }: SummaryCardProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid #F1F5F9', bgcolor: '#FFFFFF' }}>
      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: valueColor, mt: 1 }}>
        {value}
      </Typography>
    </Paper>
  );
}

interface EmployeeFiltersProps {
  searchTerm: string;
  filterDepartment: string;
  departments: Department[];
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

function EmployeeFilters({ searchTerm, filterDepartment, departments, onSearchChange, onDepartmentChange }: EmployeeFiltersProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        size="small"
        placeholder="Buscar por nome ou e-mail..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} /> }}
        sx={{ width: 300, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
      />
      <TextField
        select
        size="small"
        label="Departamento"
        value={filterDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
        sx={{ width: 200, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        SelectProps={{ MenuProps: { disableScrollLock: true } }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="A definir"><em>A definir / Diretoria</em></MenuItem>
        {departments.map((dep) => (
          <MenuItem key={dep.id} value={dep.name}>{dep.name}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

interface EmployeeTableProps {
  employees: EmployeeWithId[];
  loading: boolean;
  selected: string[];
  isSelected: (id: string) => boolean;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSelect: (id: string) => void;
  onView: (emp: EmployeeWithId) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function EmployeeTable({
  employees, loading, selected, isSelected,
  onSelectAll, onToggleSelect, onView, onEdit, onDelete,
}: EmployeeTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
    >
      <Table>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell padding="checkbox" sx={TABLE_HEADER_STYLE}>
              <Checkbox
                color="primary"
                indeterminate={selected.length > 0 && selected.length < employees.length}
                checked={employees.length > 0 && selected.length === employees.length}
                onChange={onSelectAll}
                sx={{ '&.Mui-checked': { color: '#20C975' } }}
              />
            </TableCell>
            <TableCell sx={TABLE_HEADER_STYLE}>Nome ↓</TableCell>
            <TableCell sx={TABLE_HEADER_STYLE}>Email ↓</TableCell>
            <TableCell sx={TABLE_HEADER_STYLE}>Departamento ↓</TableCell>
            <TableCell sx={TABLE_HEADER_STYLE}>Status ↓</TableCell>
            <TableCell align="right" sx={TABLE_HEADER_STYLE}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                <CircularProgress sx={{ color: '#20C975' }} />
              </TableCell>
            </TableRow>
          ) : employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>
                Nenhum colaborador encontrado.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                isSelected={isSelected(employee.id)}
                onToggleSelect={onToggleSelect}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface EmployeeRowProps {
  employee: EmployeeWithId;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onView: (emp: EmployeeWithId) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function EmployeeRow({ employee, isSelected, onToggleSelect, onView, onEdit, onDelete }: EmployeeRowProps) {
  return (
    <TableRow
      hover
      sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' }, cursor: 'pointer' }}
    >
      <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E2E8F0' }}>
        <Checkbox
          color="primary"
          checked={isSelected}
          onClick={() => onToggleSelect(employee.id)}
          sx={{ '&.Mui-checked': { color: '#20C975' } }}
        />
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={getAvatarUrl(employee.id)} sx={{ width: 40, height: 40, bgcolor: '#E5E7EB' }}>
            {employee.name?.[0]}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 450, color: '#475569', fontSize: '14px' }}>
            {employee.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={TABLE_CELL_STYLE}>{employee.email}</TableCell>
      <TableCell sx={TABLE_CELL_STYLE}>{employee.department}</TableCell>
      <TableCell sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Chip
          label={employee.isActive ? 'Ativo' : 'Inativo'}
          sx={{
            bgcolor: employee.isActive ? '#DCFCE7' : '#FEE2E2',
            color: employee.isActive ? '#166534' : '#991B1B',
            fontWeight: 600, fontSize: '12px', height: '26px', borderRadius: '6px',
          }}
        />
      </TableCell>
      <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Tooltip title="Visualizar Perfil">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(employee); }} sx={{ color: '#94A3B8', '&:hover': { color: '#20C975' } }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(employee.id); }} sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(employee.id); }} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

interface EmployeeProfileModalProps {
  open: boolean;
  employee: EmployeeWithId | null;
  onClose: () => void;
}

function EmployeeProfileModal({ open, employee, onClose }: EmployeeProfileModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableScrollLock PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ pb: 0, pt: 3, px: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={getAvatarUrl(employee?.id ?? '')} sx={{ width: 64, height: 64 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{employee?.name}</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>{employee?.email}</Typography>
          </Box>
          <Chip
            label={employee?.isActive ? 'Ativo' : 'Inativo'}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: employee?.isActive ? '#DCFCE7' : '#FEE2E2',
              color: employee?.isActive ? '#166534' : '#991B1B',
              fontWeight: 600,
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4, pt: 3 }}>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <ProfileField label="Departamento" value={employee?.department} span={6} />
          <ProfileField label="Cargo" value={employee?.cargo} span={6} />
          <ProfileField label="Nível" value={employee?.nivel} span={6} />
          <ProfileField label="Data de Admissão" value={formatDate(employee?.dataAdmissao)} span={6} />
          <Box sx={{ gridColumn: 'span 12' }}>
            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', mt: 1, border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Salário Base</Typography>
              <Typography variant="h6" sx={{ color: '#20C975', fontWeight: 700, mt: 0.5 }}>
                {formatCurrency(employee?.salario)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string | undefined;
  span: number;
}

function ProfileField({ label, value, span }: ProfileFieldProps) {
  return (
    <Box sx={{ gridColumn: `span ${span}` }}>
      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</Typography>
      <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>{value || 'Não informado'}</Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ColaboradoresList() {
  const navigate = useNavigate();

  const { employees, loading, refetch } = useEmployees();
  const departments = useDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showValues, setShowValues] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<EmployeeWithId | null>(null);

  const filteredEmployees = useFilteredEmployees(employees, searchTerm, filterDepartment);
  const { selected, isSelected, handleSelectAll, handleToggle, clearSelection } = useSelection(filteredEmployees);
  const { total, monthlyPayroll, averageSalary } = usePayrollSummary(filteredEmployees);

  const handleDeleteIndividual = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador?')) return;
    try {
      await deleteEmployee(id);
      refetch();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir o colaborador.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir ${selected.length} colaboradores?`)) return;
    try {
      await deleteMultipleEmployees(selected);
      clearSelection();
      refetch();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir colaboradores em massa.');
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
          <Button
            variant="contained"
            onClick={() => navigate('/novo')}
            disableElevation
            sx={{ bgcolor: '#20C975', color: '#FFFFFF', fontWeight: 600, px: 3, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#1BA862' } }}
          >
            Novo Colaborador
          </Button>
        </Box>
      </Box>

      <PayrollSummary
        total={total}
        monthlyPayroll={monthlyPayroll}
        averageSalary={averageSalary}
        showValues={showValues}
        onToggleVisibility={() => setShowValues((prev) => !prev)}
      />

      <EmployeeFilters
        searchTerm={searchTerm}
        filterDepartment={filterDepartment}
        departments={departments}
        onSearchChange={setSearchTerm}
        onDepartmentChange={setFilterDepartment}
      />

      <EmployeeTable
        employees={filteredEmployees}
        loading={loading}
        selected={selected}
        isSelected={isSelected}
        onSelectAll={handleSelectAll}
        onToggleSelect={handleToggle}
        onView={handleViewProfile}
        onEdit={(id) => navigate(`/editar/${id}`)}
        onDelete={handleDeleteIndividual}
      />

      <EmployeeProfileModal
        open={viewModalOpen}
        employee={employeeToView}
        onClose={() => setViewModalOpen(false)}
      />
    </Box>
  );
}