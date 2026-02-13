'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { onboardingSchema, sectors, type OnboardingData } from '@/lib/validators/cif-nif';
import { AlertCircle, CheckCircle2, Building2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    country: 'ES',
    company_size: 'small',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar datos
      const validatedData = onboardingSchema.parse(formData);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      // Crear empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...validatedData,
          owner_id: user.id,
          compliance_score: 0,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Crear perfil de usuario si no existe
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          role: 'company_owner',
        });

      if (profileError && profileError.code !== '23505') {
        console.error('Error al crear perfil:', profileError);
      }

      // Redirigir a matching engine para calcular compliance inicial
      router.push(`/onboarding/matching?company_id=${company.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear la empresa');
      setLoading(false);
    }
  };

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configura tu empresa</h1>
          <p className="text-gray-600">Obtén tu análisis de compliance en 60 segundos</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Datos básicos</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Detalles</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIF/NIF de la empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.cif_nif || ''}
                    onChange={(e) => updateField('cif_nif', e.target.value.toUpperCase())}
                    placeholder="A12345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Introduce el CIF, NIF o NIE</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Mi Empresa S.L."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contacto *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contacto@miempresa.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector *
                  </label>
                  <select
                    value={formData.sector || ''}
                    onChange={(e) => updateField('sector', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un sector</option>
                    {sectors.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño de la empresa *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'micro', label: 'Micro', desc: '< 10 empleados' },
                      { value: 'small', label: 'Pequeña', desc: '10-49 empleados' },
                      { value: 'medium', label: 'Mediana', desc: '50-249 empleados' },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => updateField('company_size', size.value)}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${formData.company_size === size.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="font-medium text-gray-900">{size.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{size.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de empleados (opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.employee_count || ''}
                    onChange={(e) => updateField('employee_count', parseInt(e.target.value) || undefined)}
                    placeholder="15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturación anual (opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.annual_revenue || ''}
                    onChange={(e) => updateField('annual_revenue', parseFloat(e.target.value) || undefined)}
                    placeholder="500000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">En euros (€)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Región (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.region || ''}
                    onChange={(e) => updateField('region', e.target.value)}
                    placeholder="Madrid, Cataluña, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código CNAE (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.cnae_code || ''}
                      onChange={(e) => updateField('cnae_code', e.target.value)}
                      placeholder="6201"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción CNAE (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.cnae_description || ''}
                      onChange={(e) => updateField('cnae_description', e.target.value)}
                      placeholder="Actividades de programación informática"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Creando...' : 'Crear empresa'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
