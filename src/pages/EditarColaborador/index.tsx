// src/pages/EditarColaborador/index.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, TextField, FormControlLabel, Switch, MenuItem, CircularProgress } from '@mui/material';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';

import { updateEmployee, getEmployeeById, checkEmailExists } from '../../services/employeeService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const employeeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  isActive: z.boolean(),
  department: z.string().min(1, 'Selecione um departamento'),
  cargo: z.string().min(2, 'Informe o cargo'),
  dataAdmissao: z.string().min(1, 'Informe a data de admissão'),
  nivel: z.string().min(1, 'Selecione o nível hierárquico'),
  gestorResponsavel: z.string().optional(),
  salario: z.string().min(1, 'Informe o salário base'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Gestor {
  id: string;
  name: string;
}

const customInputStyle = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' }
};

export default function EditarColaborador() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  
  const [activeStep, setActiveStep] = useState(0);
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalEmail, setOriginalEmail] = useState(''); // Guarda o e-mail original para validação

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { 
      name: '', email: '', isActive: true, department: '', cargo: '', dataAdmissao: '', nivel: '', gestorResponsavel: '', salario: ''
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, setError, getValues, control, reset } = methods;
  
  const nivelSelecionado = useWatch({
    control,
    name: 'nivel',
    defaultValue: ''
  });

  // Busca os dados do colaborador E a lista de gestores
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // 1. Busca os dados do colaborador 
        const employeeData = await getEmployeeById(id);
        
        // Preenche o formulário com os dados que vieram do banco
        reset({
          name: employeeData.name || '',
          email: employeeData.email || '',
          isActive: employeeData.isActive ?? true,
          department: employeeData.department || '',
          cargo: employeeData.cargo || '',
          dataAdmissao: employeeData.dataAdmissao || '',
          nivel: employeeData.nivel || '',
          gestorResponsavel: employeeData.gestorResponsavel || '',
          salario: employeeData.salario || ''
        });
        setOriginalEmail(employeeData.email || '');

        // 2. Busca a lista de gestores
        const q = query(collection(db, 'employees'), where('nivel', '==', 'Gestor')); // Lembre-se de checar o nome exato da coleção
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name 
        }));
        setGestores(lista);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Não foi possível carregar os dados deste colaborador.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset, navigate]);

  const handleNext = async () => {
    const isStepValid = await trigger(['name', 'email']); 
    
    if (isStepValid) {
      const currentEmail = getValues('email');
      
      // Só checa no banco se o usuário alterou o e-mail dele
      if (currentEmail !== originalEmail) {
        const emailAlreadyUsed = await checkEmailExists(currentEmail);
        if (emailAlreadyUsed) {
          setError('email', { type: 'manual', message: 'Este e-mail já está cadastrado no sistema.' });
          return; 
        }
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (!id) return;
      await updateEmployee(id, data); // Função de atualização 
      navigate('/'); 
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar colaborador.");
    }
  };

  const progress = activeStep === 0 ? 0 : 50; 

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#20C975' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pr: 10 }}> 
      
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Colaboradores <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography> 
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Editar Colaborador</Typography>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, width: 'calc(100% - 10px)' }}>
        <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 4, borderRadius: 2, bgcolor: '#D1FAE5', '& .MuiLinearProgress-bar': { bgcolor: '#20C975' } }} />
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, minWidth: '30px' }}>{progress}%</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 6 }}>
        
        <Box sx={{ minWidth: 220, position: 'relative', pt: 0.5 }}>
          <Box sx={{ position: 'absolute', left: 15, top: 40, height: activeStep === 0 ? 105 : 25, width: '2px', bgcolor: '#E2E8F0', zIndex: 0 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: activeStep === 0 ? 15 : 5, position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, bgcolor: activeStep >= 0 ? '#20C975' : '#E2E8F0', color: activeStep >= 0 ? '#FFFFFF' : '#64748B' }}>
              {activeStep > 0 ? <CheckIcon sx={{ fontSize: 20 }} /> : '1'}
            </Box>
            <Typography sx={{ color: activeStep >= 0 ? '#1E293B' : '#64748B', fontWeight: activeStep >= 0 ? 700 : 500, fontSize: '15px' }}>Infos Básicas</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, bgcolor: activeStep >= 1 ? '#20C975' : '#E2E8F0', color: activeStep >= 1 ? '#FFFFFF' : '#64748B' }}>2</Box>
            <Typography sx={{ color: activeStep >= 1 ? '#1E293B' : '#64748B', fontWeight: activeStep >= 1 ? 700 : 500, fontSize: '15px' }}>Infos Profissionais</Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
            {activeStep === 0 ? 'Informações Básicas' : 'Informações Profissionais'}
          </Typography>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 220 }}>
                {activeStep === 0 && (
                  <>
                    <TextField label="Título" placeholder="João da Silva" variant="outlined" fullWidth InputLabelProps={{ shrink: true }} {...methods.register('name')} error={!!methods.formState.errors.name} helperText={methods.formState.errors.name?.message} sx={customInputStyle} />
                    <TextField label="E-mail" placeholder="e.g. john@gmail.com" variant="outlined" fullWidth InputLabelProps={{ shrink: true }} {...methods.register('email')} error={!!methods.formState.errors.email} helperText={methods.formState.errors.email?.message} sx={customInputStyle} />
                    <Controller name="isActive" control={methods.control} render={({ field }) => ( <FormControlLabel control={ <Switch {...field} checked={field.value} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#20C975' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#20C975' } }} /> } label={<Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '14px' }}>Ativar no sistema</Typography>} /> )} />
                  </>
                )}

                {activeStep === 1 && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                    <Box sx={{ gridColumn: 'span 12' }}>
                      <TextField select label="Departamento" variant="outlined" fullWidth InputLabelProps={{ shrink: true }} defaultValue="" {...methods.register('department')} error={!!methods.formState.errors.department} helperText={methods.formState.errors.department?.message} sx={customInputStyle} SelectProps={{ MenuProps: { disableScrollLock: true } }}>
                        <MenuItem value="" disabled>Selecione um departamento</MenuItem>
                        <MenuItem value="Design">Design</MenuItem>
                        <MenuItem value="TI">TI</MenuItem>
                        <MenuItem value="Marketing">Marketing</MenuItem>
                        <MenuItem value="Produto">Produto</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <TextField label="Cargo" fullWidth InputLabelProps={{ shrink: true }} {...methods.register('cargo')} error={!!methods.formState.errors.cargo} helperText={methods.formState.errors.cargo?.message} sx={customInputStyle} />
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <TextField label="Data de Admissão" type="date" fullWidth InputLabelProps={{ shrink: true }} {...methods.register('dataAdmissao')} error={!!methods.formState.errors.dataAdmissao} helperText={methods.formState.errors.dataAdmissao?.message} sx={customInputStyle} />
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <TextField select label="Nível Hierárquico" fullWidth defaultValue="" InputLabelProps={{ shrink: true }} {...methods.register('nivel')} error={!!methods.formState.errors.nivel} helperText={methods.formState.errors.nivel?.message} sx={customInputStyle} SelectProps={{ MenuProps: { disableScrollLock: true } }}>
                        <MenuItem value="" disabled>Selecione</MenuItem>
                        <MenuItem value="Júnior">Júnior</MenuItem>
                        <MenuItem value="Pleno">Pleno</MenuItem>
                        <MenuItem value="Sênior">Sênior</MenuItem>
                        <MenuItem value="Gestor">Gestor</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                      <TextField select label="Gestor Responsável" fullWidth defaultValue="" InputLabelProps={{ shrink: true }} {...methods.register('gestorResponsavel')} error={!!methods.formState.errors.gestorResponsavel} helperText={methods.formState.errors.gestorResponsavel?.message} sx={customInputStyle} disabled={nivelSelecionado === 'Gestor'} SelectProps={{ MenuProps: { disableScrollLock: true } }}>
                        <MenuItem value=""><em>Nenhum</em></MenuItem>
                        {gestores.map((gestor) => (
                          <MenuItem key={gestor.id} value={gestor.id}>{gestor.name}</MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box sx={{ gridColumn: 'span 12' }}>
                      <TextField label="Salário Base (R$)" type="number" fullWidth InputLabelProps={{ shrink: true }} {...methods.register('salario')} error={!!methods.formState.errors.salario} helperText={methods.formState.errors.salario?.message} sx={customInputStyle} />
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button onClick={activeStep === 0 ? () => navigate('/') : handleBack} sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}>Voltar</Button>
                {activeStep === 0 ? (
                  <Button variant="contained" onClick={handleNext} disableElevation sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}>Próximo</Button>
                ) : (
                  <Button type="submit" variant="contained" disableElevation sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}>Salvar Alterações</Button>
                )}
              </Box>
            </form>
          </FormProvider>
        </Box>
      </Box>
    </Box>
  );
}