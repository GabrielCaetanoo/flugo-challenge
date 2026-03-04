// src/pages/NovoDepartamento/index.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem } from '@mui/material'; // Removido o Grid daqui
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { updateEmployee } from '../../services/employeeService';
import { createDepartment } from '../../services/departmentService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Validação dos dados do Departamento
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

export default function NovoDepartamento() {
  const navigate = useNavigate();
  const [gestores, setGestores] = useState<Gestor[]>([]);

  const methods = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', gestorResponsavel: '', descricao: '' },
    mode: 'onChange',
  });

  const { handleSubmit } = methods;

  useEffect(() => {
    const fetchGestores = async () => {
      try {
        const q = query(collection(db, 'employees'), where('nivel', '==', 'Gestor'));
        const querySnapshot = await getDocs(q);
        
        const lista = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name 
        }));
        
        setGestores(lista);
      } catch (error) {
        console.error("Erro ao buscar gestores:", error);
      }
    };
    fetchGestores();
  }, []);

const onSubmit = async (data: DepartmentFormData) => {
    try {
      await createDepartment(data);
      
      // A MÁGICA AQUI 👇: Puxa o gestor automaticamente para este novo departamento!
      await updateEmployee(data.gestorResponsavel, { department: data.name });
      
      navigate('/departamentos'); 
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar departamento.");
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}> 
      
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Departamentos <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography> 
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Novo Departamento</Typography>
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
        Criar Departamento
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* SOLUÇÃO DO GRID: Usando Box com CSS Grid */}
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
                  sx={customInputStyle}
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
                  placeholder="Descreva as atividades deste departamento..." 
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
            <Button 
              onClick={() => navigate('/departamentos')} 
              sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              disableElevation 
              sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}
            >
              Criar Departamento
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
}