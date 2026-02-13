'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    Building2,
    MapPin,
    Users,
    Euro,
    Save,
    Loader2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { sectors } from '@/lib/validators/cif-nif';

interface Company {
    id: string;
    name: string;
    cif_nif: string;
    email: string;
    sector: string;
    company_size: string;
    employee_count: number | null;
    annual_revenue: number | null;
    country: string;
    region: string | null;
}

export default function SettingsPage() {
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data } = await supabase
                .from('companies')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (data) {
                setCompany(data);
            }
        } catch (error) {
            console.error('Error loading company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('companies')
                .update({
                    name: company.name,
                    email: company.email,
                    sector: company.sector,
                    company_size: company.company_size,
                    employee_count: company.employee_count,
                    annual_revenue: company.annual_revenue,
                    region: company.region
                })
                .eq('id', company.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Datos actualizados correctamente' });

            // Opcional: Recalcular matching si cambian datos críticos (se haría en backend)
        } catch (error) {
            console.error('Error updating company:', error);
            setMessage({ type: 'error', text: 'Error al guardar los cambios' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof Company, value: any) => {
        setCompany(prev => prev ? { ...prev, [field]: value } : null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!company) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al dashboard
                </button>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h1>
                    <p className="text-gray-600 mt-1">Gestiona los datos de tu organización</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <Save className="w-5 h-5 mr-2" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-2" />
                        )}
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="col-span-full">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                    Información Básica
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de la empresa
                                        </label>
                                        <input
                                            type="text"
                                            value={company.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CIF/NIF
                                        </label>
                                        <input
                                            type="text"
                                            value={company.cif_nif}
                                            disabled
                                            className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-500 border p-2 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email de contacto
                                        </label>
                                        <input
                                            type="email"
                                            value={company.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 col-span-full my-2"></div>

                            {/* Classification */}
                            <div className="col-span-full">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                                    Clasificación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sector
                                        </label>
                                        <select
                                            value={company.sector}
                                            onChange={(e) => updateField('sector', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        >
                                            {sectors.map((sector) => (
                                                <option key={sector.value} value={sector.value}>
                                                    {sector.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tamaño
                                        </label>
                                        <select
                                            value={company.company_size}
                                            onChange={(e) => updateField('company_size', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        >
                                            <option value="micro">Micro (&lt; 10 empleados)</option>
                                            <option value="small">Pequeña (10-49 empleados)</option>
                                            <option value="medium">Mediana (50-249 empleados)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 col-span-full my-2"></div>

                            {/* Metrics */}
                            <div className="col-span-full">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Euro className="w-5 h-5 mr-2 text-blue-600" />
                                    Métricas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Empleados
                                        </label>
                                        <input
                                            type="number"
                                            value={company.employee_count || ''}
                                            onChange={(e) => updateField('employee_count', parseInt(e.target.value) || null)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Facturación Anual (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={company.annual_revenue || ''}
                                            onChange={(e) => updateField('annual_revenue', parseFloat(e.target.value) || null)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 col-span-full my-2"></div>

                            {/* Location */}
                            <div className="col-span-full">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                    Ubicación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            value={company.country}
                                            disabled
                                            className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-500 border p-2 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Región
                                        </label>
                                        <input
                                            type="text"
                                            value={company.region || ''}
                                            onChange={(e) => updateField('region', e.target.value)}
                                            placeholder="Madrid, Cataluña, etc."
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
