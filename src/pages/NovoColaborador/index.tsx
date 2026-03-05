// src/pages/NovoColaborador/index.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, TextField, FormControlLabel, Switch, MenuItem } from '@mui/material';
import { useForm, FormProvider, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { createEmployee, checkEmailExists } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { db } from '../../services/firebase';

// ─── Schema & Types ───────────────────────────────────────────────────────────

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

interface Manager { id: string; name: string; }
interface Department { id: string; name: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Infos Básicas', 'Infos Profissionais'];
const TOTAL_STEPS = STEPS.length;

const HIERARCHY_LEVELS = ['Júnior', 'Pleno', 'Sênior', 'Gestor'];

const CUSTOM_INPUT_STYLE = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#20C975' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#20C975' },
};

const SWITCH_STYLE = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#20C975' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#20C975' },
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

const getStepProgress = (step: number): number =>
  Math.round((step / (TOTAL_STEPS - 1)) * 50);

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useNewEmployeeData() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managersQuery = query(collection(db, 'employees'), where('nivel', '==', 'Gestor'));
        const [managersSnapshot, depsData] = await Promise.all([
          getDocs(managersQuery),
          getDepartments(),
        ]);

        setManagers(managersSnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));
        setDepartments(depsData.map((d) => ({ id: d.id, name: d.name })));
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
      }
    };

    fetchData();
  }, []);

  return { managers, departments };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StepSidebarProps {
  activeStep: number;
}

function StepSidebar({ activeStep }: StepSidebarProps) {
  return (
    <Box sx={{ minWidth: 220, position: 'relative', pt: 0.5 }}>
      <Box sx={{
        position: 'absolute', left: 15, top: 40,
        height: activeStep === 0 ? 105 : 25,
        width: '2px', bgcolor: '#E2E8F0', zIndex: 0,
      }} />
      {STEPS.map((label, index) => (
        <Box
          key={label}
          sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: activeStep === 0 && index === 0 ? 15 : 5, position: 'relative', zIndex: 1 }}
        >
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 14,
            bgcolor: activeStep >= index ? '#20C975' : '#E2E8F0',
            color: activeStep >= index ? '#FFFFFF' : '#64748B',
          }}>
            {activeStep > index ? <CheckIcon sx={{ fontSize: 20 }} /> : index + 1}
          </Box>
          <Typography sx={{
            color: activeStep >= index ? '#1E293B' : '#64748B',
            fontWeight: activeStep >= index ? 700 : 500,
            fontSize: '15px',
          }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

interface BasicInfoStepProps {
  methods: ReturnType<typeof useForm<EmployeeFormData>>;
}

function BasicInfoStep({ methods }: BasicInfoStepProps) {
  return (
    <>
      <TextField
        label="Nome"
        placeholder="João da Silva"
        variant="outlined"
        fullWidth
        InputLabelProps={{ shrink: true }}
        {...methods.register('name')}
        error={!!methods.formState.errors.name}
        helperText={methods.formState.errors.name?.message}
        sx={CUSTOM_INPUT_STYLE}
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
        sx={CUSTOM_INPUT_STYLE}
      />
      <Controller
        name="isActive"
        control={methods.control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={field.value} sx={SWITCH_STYLE} />}
            label={<Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '14px' }}>Ativar ao criar</Typography>}
          />
        )}
      />
    </>
  );
}

interface ProfessionalInfoStepProps {
  methods: ReturnType<typeof useForm<EmployeeFormData>>;
  departments: Department[];
  managers: Manager[];
  selectedLevel: string;
}

function ProfessionalInfoStep({ methods, departments, managers, selectedLevel }: ProfessionalInfoStepProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
      <Box sx={{ gridColumn: 'span 12' }}>
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
          sx={CUSTOM_INPUT_STYLE}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="" disabled>Selecione um departamento</MenuItem>
          <MenuItem value="A definir"><em>A definir / Diretoria</em></MenuItem>
          {departments.map((dep) => (
            <MenuItem key={dep.id} value={dep.name}>{dep.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
        <TextField
          label="Cargo"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...methods.register('cargo')}
          error={!!methods.formState.errors.cargo}
          helperText={methods.formState.errors.cargo?.message}
          sx={CUSTOM_INPUT_STYLE}
        />
      </Box>

      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
        <TextField
          label="Data de Admissão"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...methods.register('dataAdmissao')}
          error={!!methods.formState.errors.dataAdmissao}
          helperText={methods.formState.errors.dataAdmissao?.message}
          sx={CUSTOM_INPUT_STYLE}
        />
      </Box>

      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
        <TextField
          select
          label="Nível Hierárquico"
          fullWidth
          defaultValue=""
          InputLabelProps={{ shrink: true }}
          {...methods.register('nivel')}
          error={!!methods.formState.errors.nivel}
          helperText={methods.formState.errors.nivel?.message}
          sx={CUSTOM_INPUT_STYLE}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value="" disabled>Selecione</MenuItem>
          {HIERARCHY_LEVELS.map((level) => (
            <MenuItem key={level} value={level}>{level}</MenuItem>
          ))}
        </TextField>
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
          disabled={selectedLevel === 'Gestor'}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          <MenuItem value=""><em>Nenhum</em></MenuItem>
          {managers.map((manager) => (
            <MenuItem key={manager.id} value={manager.id}>{manager.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ gridColumn: 'span 12' }}>
        <TextField
          label="Salário Base (R$)"
          type="number"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...methods.register('salario')}
          error={!!methods.formState.errors.salario}
          helperText={methods.formState.errors.salario?.message}
          sx={CUSTOM_INPUT_STYLE}
        />
      </Box>
    </Box>
  );
}

interface FormNavigationProps {
  activeStep: number;
  onBack: () => void;
  onNext: () => void;
}

function FormNavigation({ activeStep, onBack, onNext }: FormNavigationProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
      <Button
        type="button"
        onClick={onBack}
        sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
      >
        Voltar
      </Button>
      {activeStep === 0 ? (
        <Button type="button" variant="contained" onClick={onNext} disableElevation sx={PRIMARY_BUTTON_STYLE}>
          Próximo
        </Button>
      ) : (
        <Button type="submit" variant="contained" disableElevation sx={PRIMARY_BUTTON_STYLE}>
          Concluir
        </Button>
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NovoColaborador() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '', email: '', isActive: true, department: '',
      cargo: '', dataAdmissao: '', nivel: '', gestorResponsavel: '', salario: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, setError, getValues, control } = methods;
  const selectedLevel = useWatch({ control, name: 'nivel', defaultValue: '' });

  const { managers, departments } = useNewEmployeeData();

  const handleNext = async () => {
    const isValid = await trigger(['name', 'email']);
    if (!isValid) return;

    const emailTaken = await checkEmailExists(getValues('email'));
    if (emailTaken) {
      setError('email', { type: 'manual', message: 'Este e-mail já está cadastrado no sistema.' });
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) navigate('/');
    else setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar colaborador.');
    }
  };

  return (
    <Box sx={{ width: '100%', pr: 10 }}>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontWeight: 500 }}>
        Colaboradores{' '}
        <Typography component="span" sx={{ color: '#94A3B8', mx: 1 }}>•</Typography>
        <Typography component="span" sx={{ color: '#475569', fontWeight: 600 }}>Cadastrar Colaborador</Typography>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, width: 'calc(100% - 10px)' }}>
        <LinearProgress
          variant="determinate"
          value={getStepProgress(activeStep)}
          sx={{ flexGrow: 1, height: 4, borderRadius: 2, bgcolor: '#D1FAE5', '& .MuiLinearProgress-bar': { bgcolor: '#20C975' } }}
        />
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, minWidth: '30px' }}>
          {getStepProgress(activeStep)}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 6 }}>
        <StepSidebar activeStep={activeStep} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 4, fontSize: '24px' }}>
            {STEPS[activeStep]}
          </Typography>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 220 }}>
                {activeStep === 0 && <BasicInfoStep methods={methods} />}
                {activeStep === 1 && (
                  <ProfessionalInfoStep
                    methods={methods}
                    departments={departments}
                    managers={managers}
                    selectedLevel={selectedLevel}
                  />
                )}
              </Box>

              <FormNavigation activeStep={activeStep} onBack={handleBack} onNext={handleNext} />
            </form>
          </FormProvider>
        </Box>
      </Box>
    </Box>
  );
}