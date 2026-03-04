// src/pages/DepartamentosList/index.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { getDepartments, deleteDepartment, type DepartmentData } from '../../services/departmentService';
import { getEmployees, updateEmployee, type EmployeeData } from '../../services/employeeService'; 

type DepartmentWithId = DepartmentData & { id: string };
type EmployeeWithId = EmployeeData & { id: string };

const tableHeaderStyle = { color: '#64748B', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #F1F5F9', py: 2 };
const tableCellStyle = { color: '#475569', fontSize: '14px', borderBottom: '1px solid #E2E8F0', py: 2 };

export default function DepartamentosList() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentWithId[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeWithId[]>([]);
  const [gestoresMap, setGestoresMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Transferência
  const [modalOpen, setModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentWithId | null>(null);
  const [affectedEmployees, setAffectedEmployees] = useState<EmployeeWithId[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [depsData, empData] = await Promise.all([getDepartments(), getEmployees()]);

      const map: Record<string, string> = {};
      empData.forEach(emp => {
        if (emp.nivel === 'Gestor') map[emp.id] = emp.name;
      });

      setGestoresMap(map);
      setDepartments(depsData);
      setAllEmployees(empData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // Lógica quando o botão de Lixeira é clicado
  const handleDeleteClick = (dept: DepartmentWithId) => {
    // 1. Procura se tem alguém trabalhando neste departamento
    const affected = allEmployees.filter(emp => emp.department === dept.name);

    if (affected.length === 0) {
      // 2. Se estiver vazio, deleta direto
      if (window.confirm(`Tem certeza que deseja excluir o departamento de ${dept.name}?`)) {
        executeDelete(dept.id);
      }
    } else {
      // 3. Se tiver gente, abre o Modal para transferir
      setDeptToDelete(dept);
      setAffectedEmployees(affected);
      setNewDeptName('');
      setModalOpen(true);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      fetchData(); // Atualiza a tabela
    } catch (error) {
      console.error("Erro ao excluir", error);
      alert("Erro ao excluir departamento.");
    }
  };

  // Lógica que executa a Transferência e a Exclusão juntas
  const handleTransferAndDelete = async () => {
    if (!newDeptName) return alert("Por favor, selecione um novo departamento para os colaboradores.");
    if (!deptToDelete) return;

    try {
      setIsTransferring(true);
      
      // 1. Atualiza o departamento de todos os funcionários afetados
      await Promise.all(
        affectedEmployees.map(emp => updateEmployee(emp.id, { department: newDeptName }))
      );

      // 2. Após transferir todos com sucesso, deleta o departamento antigo
      await deleteDepartment(deptToDelete.id);

      // 3. Fecha o modal e atualiza a tela
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao transferir e excluir", error);
      alert("Ocorreu um erro durante a transferência.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '22px' }}>
          Departamentos
        </Typography>
        <Button variant="contained" onClick={() => navigate('/departamentos/novo')} disableElevation sx={{ bgcolor: '#20C975', color: '#FFFFFF', fontWeight: 600, px: 3, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#1BA862' } }}>
          Novo Departamento
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={tableHeaderStyle}>Nome do Departamento ↓</TableCell>
              <TableCell sx={tableHeaderStyle}>Gestor Responsável ↓</TableCell>
              <TableCell align="right" sx={tableHeaderStyle}>Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, borderBottom: 'none' }}><CircularProgress sx={{ color: '#20C975' }} /></TableCell></TableRow>
            ) : departments.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: '#94A3B8', borderBottom: 'none' }}>Nenhum departamento cadastrado ainda.</TableCell></TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id} hover sx={{ transition: 'all 0.2s ease', '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <TableCell sx={{ ...tableCellStyle, fontWeight: 500 }}>{dept.name}</TableCell>
                  <TableCell sx={tableCellStyle}>{gestoresMap[dept.gestorResponsavel] || <Typography component="span" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>Sem gestor vinculado</Typography>}</TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #E2E8F0', py: 2 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => navigate(`/departamentos/editar/${dept.id}`)} sx={{ color: '#94A3B8', '&:hover': { color: '#3B82F6' } }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => handleDeleteClick(dept)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL DE TRANSFERÊNCIA */}
      <Dialog open={modalOpen} onClose={() => !isTransferring && setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', pb: 1 }}>
          Atenção: Departamento em Uso
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
            Existem <strong>{affectedEmployees.length} colaborador(es)</strong> vinculados ao departamento de <strong>{deptToDelete?.name}</strong>. Para excluir este departamento, você precisa transferi-los para um novo setor.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Novo Departamento</InputLabel>
            <Select
              value={newDeptName}
              label="Novo Departamento"
              onChange={(e) => setNewDeptName(e.target.value)}
              MenuProps={{ disableScrollLock: true }}
            >
              <MenuItem value="" disabled>Selecione o destino...</MenuItem>
              {departments
                .filter(d => d.id !== deptToDelete?.id) // Remove o departamento atual da lista de opções!
                .map(d => (
                  <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={() => setModalOpen(false)} disabled={isTransferring} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
            <Button 
            onClick={handleTransferAndDelete} 
            variant="contained" 
            disabled={isTransferring}
            disableElevation // <-- Coloquei pro lado de fora do sx!
            sx={{ bgcolor: '#EF4444', color: '#FFF', '&:hover': { bgcolor: '#DC2626' }, textTransform: 'none', fontWeight: 600 }}>
            {isTransferring ? 'Transferindo...' : 'Transferir e Excluir'}
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}