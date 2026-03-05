// src/pages/DepartamentosList/index.tsx
import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { getDepartments, deleteDepartment, type DepartmentData } from '../../services/departmentService';
import { getEmployees, updateEmployee, type EmployeeData } from '../../services/employeeService';

// ─── Types ────────────────────────────────────────────────────────────────────

type DepartmentWithId = DepartmentData & { id: string };
type EmployeeWithId = EmployeeData & { id: string };

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildManagersMap = (employees: EmployeeWithId[]): Record<string, string> =>
  employees.reduce<Record<string, string>>((acc, emp) => {
    if (emp.nivel === 'Gestor') acc[emp.id] = emp.name;
    return acc;
  }, {});

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

function useDepartmentsData() {
  const [departments, setDepartments] = useState<DepartmentWithId[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeWithId[]>([]);
  const [managersMap, setManagersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [depsData, empData] = await Promise.all([getDepartments(), getEmployees()]);
      setManagersMap(buildManagersMap(empData));
      setDepartments(depsData);
      setAllEmployees(empData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { departments, allEmployees, managersMap, loading, refetch: fetchData };
}

function useTransferModal(departments: DepartmentWithId[], allEmployees: EmployeeWithId[], onSuccess: () => void) {
  const [modalOpen, setModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentWithId | null>(null);
  const [affectedEmployees, setAffectedEmployees] = useState<EmployeeWithId[]>([]);
  const [targetDepartmentName, setTargetDepartmentName] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const availableDepartments = departments.filter((d) => d.id !== departmentToDelete?.id);

  const openModal = (dept: DepartmentWithId) => {
    setDepartmentToDelete(dept);
    setAffectedEmployees(allEmployees.filter((emp) => emp.department === dept.name));
    setTargetDepartmentName('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!isTransferring) setModalOpen(false);
  };

  const handleTransferAndDelete = async () => {
    if (!targetDepartmentName) return alert('Por favor, selecione um novo departamento para os colaboradores.');
    if (!departmentToDelete) return;

    try {
      setIsTransferring(true);
      await Promise.all(
        affectedEmployees.map((emp) => updateEmployee(emp.id, { department: targetDepartmentName }))
      );
      await deleteDepartment(departmentToDelete.id);
      setModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao transferir e excluir:', error);
      alert('Ocorreu um erro durante a transferência.');
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    modalOpen, departmentToDelete, affectedEmployees,
    targetDepartmentName, setTargetDepartmentName,
    isTransferring, availableDepartments,
    openModal, closeModal, handleTransferAndDelete,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DepartmentTableProps {
  departments: DepartmentWithId[];
  managersMap: Record<string, string>;
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (dept: DepartmentWithId) => void;
}

function DepartmentTable({ departments, managersMap, loading, onEdit, onDelete }: DepartmentTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}
    >
      <Table>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={TABLE_HEADER_STYLE}>Nome do Departamento ↓</TableCell>
            <TableCell sx={TABLE_HEADER_STYLE}>Gestor Responsável ↓</TableCell>
            <TableCell align="right" sx={TABLE_HEADER_STYLE}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                <CircularProgress sx={{ color: '#20C975' }} />
              </TableCell>
            </TableRow>
          ) : departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>
                Nenhum departamento cadastrado ainda.
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <DepartmentRow
                key={dept.id}
                department={dept}
                managerName={managersMap[dept.gestorResponsavel]}
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

interface DepartmentRowProps {
  department: DepartmentWithId;
  managerName: string | undefined;
  onEdit: (id: string) => void;
  onDelete: (dept: DepartmentWithId) => void;
}

function DepartmentRow({ department, managerName, onEdit, onDelete }: DepartmentRowProps) {
  return (
    <TableRow hover sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' } }}>
      <TableCell sx={{ ...TABLE_CELL_STYLE, fontWeight: 500 }}>{department.name}</TableCell>
      <TableCell sx={TABLE_CELL_STYLE}>
        {managerName ?? (
          <Typography component="span" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
            Sem gestor vinculado
          </Typography>
        )}
      </TableCell>
      <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(department.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" onClick={() => onDelete(department)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

interface TransferModalProps {
  open: boolean;
  departmentToDelete: DepartmentWithId | null;
  affectedEmployees: EmployeeWithId[];
  availableDepartments: DepartmentWithId[];
  targetDepartmentName: string;
  isTransferring: boolean;
  onTargetChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function TransferModal({
  open, departmentToDelete, affectedEmployees, availableDepartments,
  targetDepartmentName, isTransferring,
  onTargetChange, onClose, onConfirm,
}: TransferModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', pb: 1 }}>
        Atenção: Departamento em Uso
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
          Existem <strong>{affectedEmployees.length} colaborador(es)</strong> vinculados ao departamento de{' '}
          <strong>{departmentToDelete?.name}</strong>. Para excluir este departamento, você precisa transferi-los para um novo setor.
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Novo Departamento</InputLabel>
          <Select
            value={targetDepartmentName}
            label="Novo Departamento"
            onChange={(e) => onTargetChange(e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="" disabled>Selecione o destino...</MenuItem>
            {availableDepartments.map((d) => (
              <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={isTransferring}
          sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isTransferring}
          disableElevation
          sx={{ bgcolor: '#EF4444', color: '#FFF', '&:hover': { bgcolor: '#DC2626' }, textTransform: 'none', fontWeight: 600 }}
        >
          {isTransferring ? 'Transferindo...' : 'Transferir e Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DepartamentosList() {
  const navigate = useNavigate();

  const { departments, allEmployees, managersMap, loading, refetch } = useDepartmentsData();

  const {
    modalOpen, departmentToDelete, affectedEmployees,
    targetDepartmentName, setTargetDepartmentName,
    isTransferring, availableDepartments,
    openModal, closeModal, handleTransferAndDelete,
  } = useTransferModal(departments, allEmployees, refetch);

  const handleDeleteClick = (dept: DepartmentWithId) => {
    const hasEmployees = allEmployees.some((emp) => emp.department === dept.name);

    if (!hasEmployees) {
      if (window.confirm(`Tem certeza que deseja excluir o departamento de ${dept.name}?`)) {
        deleteDepartment(dept.id)
          .then(refetch)
          .catch((error) => {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir departamento.');
          });
      }
      return;
    }

    openModal(dept);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '22px' }}>
          Departamentos
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/departamentos/novo')}
          disableElevation
          sx={{ bgcolor: '#20C975', color: '#FFFFFF', fontWeight: 600, px: 3, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#1BA862' } }}
        >
          Novo Departamento
        </Button>
      </Box>

      <DepartmentTable
        departments={departments}
        managersMap={managersMap}
        loading={loading}
        onEdit={(id) => navigate(`/departamentos/editar/${id}`)}
        onDelete={handleDeleteClick}
      />

      <TransferModal
        open={modalOpen}
        departmentToDelete={departmentToDelete}
        affectedEmployees={affectedEmployees}
        availableDepartments={availableDepartments}
        targetDepartmentName={targetDepartmentName}
        isTransferring={isTransferring}
        onTargetChange={setTargetDepartmentName}
        onClose={closeModal}
        onConfirm={handleTransferAndDelete}
      />
    </Box>
  );
}