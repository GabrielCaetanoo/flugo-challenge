// src/pages/NovoColaborador/index.tsx
import { useState } from 'react';
import { Box, Typography, Button, LinearProgress, TextField, FormControlLabel, Switch, MenuItem } from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../../services/employeeService';

// 1. Schema de validação com Zod
const employeeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  isActive: z.boolean(),
  department: z.string().min(1, 'Selecione um departamento'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function NovoColaborador() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // 2. Configuração do React Hook Form
  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      isActive: true,
      department: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger } = methods;

  // 3. Funções de navegação do Multi-step
  const handleNext = async () => {
    const isStepValid = await trigger(['name', 'email']); 
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // 4. Função Final (Salvar no Firebase)
  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      // Redireciona para a lista após salvar com sucesso
      navigate('/'); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar colaborador. Tente novamente.");
    }
  };

  const progress = activeStep === 0 ? 0 : 50; 

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Breadcrumbs */}
      <Typography variant="body2" color="text.secondary" mb={3}>
        Colaboradores • <Typography component="span" color="text.primary">Cadastrar Colaborador</Typography>
      </Typography>

      {/* Barra de Progresso */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            flexGrow: 1, 
            height: 4, 
            borderRadius: 2, 
            bgcolor: '#E0E0E0', 
            '& .MuiLinearProgress-bar': { bgcolor: '#20C975' } 
          }} 
        />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {progress}%
        </Typography>
      </Box>

      {/* Container Principal */}
      <Box sx={{ display: 'flex', gap: 6 }}>
        
        {/* Coluna Esquerda: Indicadores */}
        <Box sx={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Typography color={activeStep === 0 ? '#212121' : '#9E9E9E'} fontWeight={activeStep === 0 ? 'bold' : 'normal'}>
             1. Infos Básicas
           </Typography>
           <Typography color={activeStep === 1 ? '#212121' : '#9E9E9E'} fontWeight={activeStep === 1 ? 'bold' : 'normal'}>
             2. Infos Profissionais
           </Typography>
        </Box>

        {/* Coluna Direita: O Formulário */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold" color="#212121" mb={4}>
            {activeStep === 0 ? 'Informações Básicas' : 'Informações Profissionais'}
          </Typography>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* PASSO 1: INFORMAÇÕES BÁSICAS */}
              {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                  <TextField
                    label="Título"
                    placeholder="João da Silva"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...methods.register('name')}
                    error={!!methods.formState.errors.name}
                    helperText={methods.formState.errors.name?.message}
                  />

                  <TextField
                    label="E-mail"
                    placeholder="e.g. john@gmail.com"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...methods.register('email')}
                    error={!!methods.formState.errors.email}
                    helperText={methods.formState.errors.email?.message}
                  />

                  <Controller
                    name="isActive"
                    control={methods.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} color="primary" />}
                        label={<Typography variant="body2" color="#424242" fontWeight={500}>Ativar ao criar</Typography>}
                      />
                    )}
                  />
                </Box>
              )}

              {/* PASSO 2: INFORMAÇÕES PROFISSIONAIS */}
              {activeStep === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                  <TextField
                    select
                    label="Departamento"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    defaultValue=""
                    {...methods.register('department')}
                    error={!!methods.formState.errors.department}
                    helperText={methods.formState.errors.department?.message}
                  >
                    {/* Opção desabilitada para servir como placeholder */}
                    <MenuItem value="" disabled>
                      Selecione um departamento
                    </MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="TI">TI</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Produto">Produto</MenuItem>
                    <MenuItem value="Vendas">Vendas</MenuItem>
                    <MenuItem value="RH">RH</MenuItem>
                  </TextField>
                </Box>
              )}

              {/* Botões */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button 
                  onClick={activeStep === 0 ? () => navigate('/') : handleBack} 
                  sx={{ color: '#757575', fontWeight: 'bold' }}
                >
                  Voltar
                </Button>
                
                {activeStep === 0 ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNext} 
                    sx={{ fontWeight: 'bold', px: 4, boxShadow: 'none' }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    sx={{ fontWeight: 'bold', px: 4, boxShadow: 'none' }}
                  >
                    Concluir
                  </Button>
                )}
              </Box>
            </form>
          </FormProvider>
        </Box>
      </Box>
    </Box>
  );
}