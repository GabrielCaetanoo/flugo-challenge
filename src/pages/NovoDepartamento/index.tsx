// src/pages/NovoDepartamento/index.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { updateEmployee } from '../../services/employeeService';
import { createDepartment } from '../../services/departmentService';
import { db } from '../../services/firebase';

// ─── Schema & Types ───────────────────────────────────────────────────────────

const departmentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  gestorResponsavel: z.string().min(1, 'Selecione um gestor responsável'),
  descricao: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

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

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managersQuery = query(collection(db, 'employees'), where('nivel', '==', 'Gestor'));
        const snapshot = await getDocs(managersQuery);
        setManagers(snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
      } catch (error) {
        console.error('Erro ao buscar gestores:', error);
      }
    };

    fetchManagers();
  }, []);

  return managers;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovoDepartamento() {
  const navigate = useNavigate();
  const managers = useManagers();

  const methods = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', gestorResponsavel: '', descricao: '' },
    mode: 'onChange',
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      await createDepartment(data);
      await updateEmployee(data.gestorResponsavel, { department: data.name });
      navigate('/departamentos');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar departamento.');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Departamentos{' '}
        <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography>
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Novo Departamento</Typography>
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
        Criar Departamento
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                label="Nome do Departamento"
                placeholder="e.g. Financeiro"
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
                defaultValue=""
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
                placeholder="Descreva as atividades deste departamento..."
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
              onClick={() => navigate('/departamentos')}
              sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disableElevation sx={PRIMARY_BUTTON_STYLE}>
              Criar Departamento
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
}