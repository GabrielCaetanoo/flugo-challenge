// src/pages/EditarDepartamento/index.tsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, CircularProgress,
  Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { updateEmployee, type EmployeeData } from '../../services/employeeService';
import { getDepartmentById, updateDepartment } from '../../services/departmentService';
import { db } from '../../services/firebase';

// ─── Schema & Types ───────────────────────────────────────────────────────────

const departmentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  gestorResponsavel: z.string().min(1, 'Selecione um gestor responsável'),
  descricao: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;
type EmployeeWithId = EmployeeData & { id: string };

interface Manager { id: string; name: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const CUSTOM_INPUT_STYLE = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' },
};

const PRIMARY_BUTTON_STYLE = {
  bgcolor: '#20C975',
  color: '#FFFFFF',
  '&:hover': { bgcolor: '#1BA862' },
  fontWeight: 600,
  px: 4,
  py: 1,
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '15px',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarUrl = (id: string): string =>
  `https://api.dicebear.com/9.x/personas/svg?seed=${id}&backgroundColor=e5e7eb&radius=50`;

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useEditDepartmentData(
  id: string | undefined,
  reset: (data: DepartmentFormData) => void,
  navigate: ReturnType<typeof useNavigate>
) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [members, setMembers] = useState<EmployeeWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const deptData = await getDepartmentById(id);
        reset({
          name: deptData.name,
          gestorResponsavel: deptData.gestorResponsavel,
          descricao: deptData.descricao || '',
        });

        const managersQuery = query(collection(db, 'employees'), where('nivel', '==', 'Gestor'));
        const membersQuery = query(collection(db, 'employees'), where('department', '==', deptData.name));

        const [managersSnap, membersSnap] = await Promise.all([
          getDocs(managersQuery),
          getDocs(membersQuery),
        ]);

        setManagers(managersSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
        setMembers(membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmployeeWithId)));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao buscar departamento.');
        navigate('/departamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, navigate]);

  return { managers, members, loading };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DepartmentFormProps {
  methods: ReturnType<typeof useForm<DepartmentFormData>>;
  managers: Manager[];
  onCancel: () => void;
}

function DepartmentForm({ methods, managers, onCancel }: DepartmentFormProps) {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <TextField
            label="Nome do Departamento"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...methods.register('name')}
            error={!!methods.formState.errors.name}
            helperText={methods.formState.errors.name?.message}
            sx={CUSTOM_INPUT_STYLE}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <TextField
            select
            label="Gestor Responsável"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...methods.register('gestorResponsavel')}
            error={!!methods.formState.errors.gestorResponsavel}
            helperText={methods.formState.errors.gestorResponsavel?.message}
            sx={CUSTOM_INPUT_STYLE}
            SelectProps={{ MenuProps: { disableScrollLock: true } }}
          >
            <MenuItem value="" disabled>Selecione um gestor</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.id} value={manager.id}>{manager.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ gridColumn: 'span 12' }}>
          <TextField
            label="Descrição (Opcional)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
            {...methods.register('descricao')}
            sx={CUSTOM_INPUT_STYLE}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 6 }}>
        <Button
          onClick={onCancel}
          sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disableElevation sx={PRIMARY_BUTTON_STYLE}>
          Salvar Alterações
        </Button>
      </Box>
    </Box>
  );
}

interface MembersListProps {
  members: EmployeeWithId[];
}

function MembersList({ members }: MembersListProps) {
  return (
    <Box sx={{ mt: 8 }}>
      <Divider sx={{ mb: 4 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
        Colaboradores neste Departamento ({members.length})
      </Typography>

      {members.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Nenhum colaborador vinculado a este departamento no momento.
        </Typography>
      ) : (
        <List sx={{ bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          {members.map((member, index) => (
            <Box key={member.id}>
              <MemberListItem member={member} />
              {index < members.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}

interface MemberListItemProps {
  member: EmployeeWithId;
}

function MemberListItem({ member }: MemberListItemProps) {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={getAvatarUrl(member.id)} sx={{ bgcolor: '#E2E8F0' }} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>
            {member.name}
          </Typography>
        }
        secondary={
          <Typography sx={{ color: '#64748B', fontSize: '13px' }}>
            {member.cargo || 'Cargo não informado'}
          </Typography>
        }
      />
      <Chip
        label={member.nivel || 'Nível não informado'}
        size="small"
        sx={{ bgcolor: '#E2E8F0', color: '#475569', fontWeight: 600, fontSize: '12px', borderRadius: '6px' }}
      />
    </ListItem>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditarDepartamento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const methods = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', gestorResponsavel: '', descricao: '' },
    mode: 'onChange',
  });

  const { handleSubmit, reset } = methods;
  const { managers, members, loading } = useEditDepartmentData(id, reset, navigate);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (!id) return;
      await updateDepartment(id, data);
      await updateEmployee(data.gestorResponsavel, { department: data.name });
      navigate('/departamentos');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar departamento.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#20C975' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Departamentos{' '}
        <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography>
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Editar Departamento</Typography>
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
        Editar Departamento
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DepartmentForm
            methods={methods}
            managers={managers}
            onCancel={() => navigate('/departamentos')}
          />
        </form>
      </FormProvider>

      <MembersList members={members} />
    </Box>
  );
}