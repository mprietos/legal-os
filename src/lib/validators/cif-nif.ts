import { z } from 'zod';

// Validador de CIF/NIF español
export const cifNifSchema = z.string().refine((value) => {
  const cleanValue = value.toUpperCase().replace(/[\s-]/g, '');

  // NIF: 8 dígitos + letra
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  // CIF: letra + 7 dígitos + letra/dígito
  const cifRegex = /^[A-Z][0-9]{7}[A-Z0-9]$/;
  // NIE: X/Y/Z + 7 dígitos + letra
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  return nifRegex.test(cleanValue) || cifRegex.test(cleanValue) || nieRegex.test(cleanValue);
}, {
  message: 'CIF/NIF no válido. Debe ser un CIF, NIF o NIE español válido.',
});

// Inferir datos de empresa a partir del CIF
export function inferCompanyDataFromCIF(cif: string): {
  type: 'individual' | 'company';
  legalForm?: string;
} {
  const cleanCIF = cif.toUpperCase().replace(/[\s-]/g, '');
  const firstChar = cleanCIF[0];

  // Tipos de entidad según el primer carácter del CIF
  const entityTypes: Record<string, { type: 'individual' | 'company'; legalForm?: string }> = {
    'A': { type: 'company', legalForm: 'Sociedad Anónima' },
    'B': { type: 'company', legalForm: 'Sociedad de Responsabilidad Limitada' },
    'C': { type: 'company', legalForm: 'Sociedad Colectiva' },
    'D': { type: 'company', legalForm: 'Sociedad Comanditaria' },
    'E': { type: 'company', legalForm: 'Comunidad de Bienes' },
    'F': { type: 'company', legalForm: 'Sociedad Cooperativa' },
    'G': { type: 'company', legalForm: 'Asociación' },
    'H': { type: 'company', legalForm: 'Comunidad de Propietarios' },
    'J': { type: 'company', legalForm: 'Sociedad Civil' },
    'N': { type: 'company', legalForm: 'Entidad Extranjera' },
    'P': { type: 'company', legalForm: 'Corporación Local' },
    'Q': { type: 'company', legalForm: 'Organismo Autónomo' },
    'R': { type: 'company', legalForm: 'Congregación o Institución Religiosa' },
    'S': { type: 'company', legalForm: 'Órgano de la Administración del Estado' },
    'U': { type: 'company', legalForm: 'Unión Temporal de Empresas' },
    'V': { type: 'company', legalForm: 'Fondo de Inversión' },
    'W': { type: 'company', legalForm: 'Establecimiento Permanente' },
  };

  // Si empieza con número o X/Y/Z es un NIF/NIE (persona física)
  if (/^[0-9XYZ]/.test(firstChar)) {
    return { type: 'individual' };
  }

  return entityTypes[firstChar] || { type: 'company' };
}

// Datos de onboarding
export const onboardingSchema = z.object({
  cif_nif: cifNifSchema,
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email no válido'),
  sector: z.string().min(1, 'Selecciona un sector'),
  company_size: z.enum(['micro', 'small', 'medium'], {
    errorMap: () => ({ message: 'Selecciona un tamaño de empresa' }),
  }),
  employee_count: z.number().int().min(0, 'Número de empleados no válido').optional(),
  annual_revenue: z.number().min(0, 'Facturación no válida').optional(),
  country: z.string().length(2, 'Código de país no válido'),
  region: z.string().optional(),
  cnae_code: z.string().optional(),
  cnae_description: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

// Catálogo de sectores
export const sectors = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'comercio', label: 'Comercio y Retail' },
  { value: 'servicios', label: 'Servicios Profesionales' },
  { value: 'hosteleria', label: 'Hostelería y Turismo' },
  { value: 'industria', label: 'Industria y Manufactura' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'salud', label: 'Salud y Bienestar' },
  { value: 'educacion', label: 'Educación' },
  { value: 'transporte', label: 'Transporte y Logística' },
  { value: 'agricultura', label: 'Agricultura y Ganadería' },
  { value: 'otros', label: 'Otros' },
];
