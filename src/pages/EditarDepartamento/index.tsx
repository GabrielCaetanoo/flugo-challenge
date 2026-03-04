// src/pages/EditarDepartamento/index.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, CircularProgress, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { updateEmployee } from '../../services/employeeService';
import { getDepartmentById, updateDepartment } from '../../services/departmentService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { type EmployeeData } from '../../services/employeeService'; // Importando o tipo

const departmentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  gestorResponsavel: z.string().min(1, 'Selecione um gestor responsável'),
  descricao: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface Gestor {
  id: string;
  name: string;
}

const customInputStyle = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' }
};

export default function EditarDepartamento() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [membros, setMembros] = useState<(EmployeeData & { id: string })[]>([]); // Estado para os membros
  const [loading, setLoading] = useState(true);

  const methods = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', gestorResponsavel: '', descricao: '' },
    mode: 'onChange',
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // 1. Busca os dados do departamento
        const deptData = await getDepartmentById(id);
        reset({
          name: deptData.name,
          gestorResponsavel: deptData.gestorResponsavel,
          descricao: deptData.descricao || ''
        });

        // 2. Busca os gestores disponíveis
        const qGestores = query(collection(db, 'employees'), where('nivel', '==', 'Gestor'));
        const gestoresSnap = await getDocs(qGestores);
        const listaGestores = gestoresSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setGestores(listaGestores);

        // 3. Busca os colaboradores que pertencem a este departamento
        const qMembros = query(collection(db, 'employees'), where('department', '==', deptData.name));
        const membrosSnap = await getDocs(qMembros);
        const listaMembros = membrosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as (EmployeeData & { id: string })));
        setMembros(listaMembros);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao buscar departamento.");
        navigate('/departamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, navigate]);

const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (!id) return;
      await updateDepartment(id, data);
      
      // A MÁGICA AQUI 👇: Puxa o gestor atualizado para este departamento!
      await updateEmployee(data.gestorResponsavel, { department: data.name });
      
      navigate('/departamentos');
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar departamento.");
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
        Departamentos <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography> 
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Editar Departamento</Typography>
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
        Editar Departamento
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
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
                  sx={customInputStyle}
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
                  sx={customInputStyle}
                  SelectProps={{ MenuProps: { disableScrollLock: true } }}
                >
                  <MenuItem value="" disabled>Selecione um gestor</MenuItem>
                  {gestores.map((gestor) => (
                    <MenuItem key={gestor.id} value={gestor.id}>{gestor.name}</MenuItem>
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
                  sx={customInputStyle}
                />
              </Box>
            </Box>

          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 6 }}>
            <Button onClick={() => navigate('/departamentos')} sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disableElevation sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}>
              Salvar Alterações
            </Button>
          </Box>
        </form>
      </FormProvider>

      {/* SESSÃO DE MEMBROS DO DEPARTAMENTO */}
      <Box sx={{ mt: 8 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
          Colaboradores neste Departamento ({membros.length})
        </Typography>
        
        {membros.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>Nenhum colaborador vinculado a este departamento no momento.</Typography>
        ) : (
          <List sx={{ bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            {membros.map((membro, index) => (
              <Box key={membro.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={`https://api.dicebear.com/9.x/personas/svg?seed=${membro.id}&backgroundColor=e5e7eb&radius=50`} sx={{ bgcolor: '#E2E8F0' }} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>{membro.name}</Typography>} 
                    secondary={<Typography sx={{ color: '#64748B', fontSize: '13px' }}>{membro.cargo || 'Cargo não informado'}</Typography>} 
                  />
                  <Chip 
                    label={membro.nivel || 'Nível não informado'} 
                    size="small" 
                    sx={{ bgcolor: '#E2E8F0', color: '#475569', fontWeight: 600, fontSize: '12px', borderRadius: '6px' }} 
                  />
                </ListItem>
                {index < membros.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}