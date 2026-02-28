// src/pages/NovoColaborador/index.tsx
import { useState } from 'react';
import { Box, Typography, Button, LinearProgress, TextField, FormControlLabel, Switch, MenuItem } from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';

import { createEmployee, checkEmailExists } from '../../services/employeeService';

const employeeSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Digite um e-mail válido'),
  isActive: z.boolean(),
  department: z.string().min(1, 'Selecione um departamento'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const customInputStyle = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' }
};

export default function NovoColaborador() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: '', isActive: true, department: '' },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, setError, getValues } = methods;

  const handleNext = async () => {
    const isStepValid = await trigger(['name', 'email']); 
    
    if (isStepValid) {
      const emailAlreadyUsed = await checkEmailExists(getValues('email'));
      if (emailAlreadyUsed) {
        setError('email', { type: 'manual', message: 'Este e-mail já está cadastrado no sistema.' });
        return; 
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      navigate('/'); 
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar colaborador.");
    }
  };

  const progress = activeStep === 0 ? 0 : 50; 

  return (
    <Box sx={{ width: '100%', pr: 10 }}> 
      
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Colaboradores <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography> 
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Cadastrar Colaborador</Typography>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, width: 'calc(100% - 10px)' }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ flexGrow: 1, height: 4, borderRadius: 2, bgcolor: '#D1FAE5', '& .MuiLinearProgress-bar': { bgcolor: '#20C975' } }} 
        />
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, minWidth: '30px' }}>{progress}%</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 6 }}>
        
        <Box sx={{ minWidth: 220, position: 'relative', pt: 0.5 }}>
          <Box sx={{ position: 'absolute', left: 15, top: 40, height: activeStep === 0 ? 105 : 25, width: '2px', bgcolor: '#E2E8F0', zIndex: 0 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: activeStep === 0 ? 15 : 5, position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14,
                bgcolor: activeStep >= 0 ? '#20C975' : '#E2E8F0', color: activeStep >= 0 ? '#FFFFFF' : '#64748B' }}>
              {activeStep > 0 ? <CheckIcon sx={{ fontSize: 20 }} /> : '1'}
            </Box>
            <Typography sx={{ color: activeStep >= 0 ? '#1E293B' : '#64748B', fontWeight: activeStep >= 0 ? 700 : 500, fontSize: '15px' }}>
              Infos Básicas
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14,
                bgcolor: activeStep >= 1 ? '#20C975' : '#E2E8F0', color: activeStep >= 1 ? '#FFFFFF' : '#64748B' }}>
              2
            </Box>
            <Typography sx={{ color: activeStep >= 1 ? '#1E293B' : '#64748B', fontWeight: activeStep >= 1 ? 700 : 500, fontSize: '15px' }}>
              Infos Profissionais
            </Typography>
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
                    <TextField 
                      label="Título" 
                      placeholder="João da Silva" 
                      variant="outlined" 
                      fullWidth 
                      InputLabelProps={{ shrink: true }}
                      {...methods.register('name')} 
                      error={!!methods.formState.errors.name} 
                      helperText={methods.formState.errors.name?.message}
                      sx={customInputStyle}
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
                      sx={customInputStyle}
                    />
                    
                    <Controller 
                      name="isActive" 
                      control={methods.control} 
                      render={({ field }) => (
                        <FormControlLabel 
                          control={
                            <Switch 
                              {...field} 
                              checked={field.value} 
                              sx={{ 
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#20C975' }, 
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#20C975' } 
                              }} 
                            />
                          } 
                          label={<Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '14px' }}>Ativar ao criar</Typography>} 
                        />
                      )}
                    />
                  </>
                )}

                {activeStep === 1 && (
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
                    sx={customInputStyle}
                    SelectProps={{ MenuProps: { disableScrollLock: true } }} 
                  >
                    <MenuItem value="" disabled>Selecione um departamento</MenuItem>
                    <MenuItem value="Design">Design</MenuItem>
                    <MenuItem value="TI">TI</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Produto">Produto</MenuItem>
                  </TextField>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button 
                  onClick={activeStep === 0 ? () => navigate('/') : handleBack} 
                  sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
                >
                  Voltar
                </Button>
                
                {activeStep === 0 ? (
                  <Button 
                    variant="contained" 
                    onClick={handleNext} 
                    disableElevation 
                    sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disableElevation 
                    sx={{ bgcolor: '#20C975', color: '#FFFFFF', '&:hover': { bgcolor: '#1BA862' }, fontWeight: 600, px: 4, py: 1, borderRadius: '8px', textTransform: 'none', fontSize: '15px' }}
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