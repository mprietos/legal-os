'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    Building2,
    MapPin,
    Euro,
    Calendar,
    Search,
    ArrowRight,
    TrendingUp,
    Gift,
    ArrowLeft
} from 'lucide-react';

interface GrantOpportunity {
    id: string;
    match_score: number;
    status: string;
    grant: {
        id: string;
        title: string;
        description: string;
        issuer: string;
        max_amount: number | null;
        application_deadline: string | null;
        funding_type: string;
    };
}

export default function GrantsPage() {
    const router = useRouter();
    const [grants, setGrants] = useState<GrantOpportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGrants();
    }, []);

    const loadGrants = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Obtener empresa del usuario
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (company) {
                const { data } = await supabase
                    .from('company_grants')
                    .select(`
            *,
            grant:grants(*)
          `)
                    .eq('company_id', company.id)
                    .order('match_score', { ascending: false });

                setGrants(data || []);
            }
        } catch (error) {
            console.error('Error loading grants:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            opportunity: { label: 'Oportunidad', className: 'bg-blue-100 text-blue-800' },
            in_progress: { label: 'En proceso', className: 'bg-yellow-100 text-yellow-800' },
            submitted: { label: 'Presentada', className: 'bg-purple-100 text-purple-800' },
            awarded: { label: 'Concedida', className: 'bg-green-100 text-green-800' },
            rejected: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
        };
        const badge = badges[status] || badges.opportunity;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al dashboard
                </button>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Ayudas y Subvenciones</h1>
                    <p className="text-gray-600 mt-1">Oportunidades de financiación adaptadas a tu empresa</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar ayudas..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900">
                        <option value="all">Todas las categorías</option>
                        <option value="innovation">Innovación</option>
                        <option value="digital">Digitalización</option>
                        <option value="sustainability">Sostenibilidad</option>
                        <option value="hiring">Contratación</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {grants.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                            onClick={() => router.push(`/dashboard/grants/${item.id}`)}
                        >
                            {/* Match Score Indicator */}
                            <div className="absolute top-0 right-0 p-4">
                                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full ${item.match_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    <span className="text-xl font-bold">{item.match_score}%</span>
                                    <span className="text-[10px] uppercase">Match</span>
                                </div>
                            </div>

                            <div className="pr-20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center text-sm text-gray-500">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        {item.grant.issuer}
                                    </span>
                                    {getStatusBadge(item.status)}
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {item.grant.title}
                                </h3>

                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {item.grant.description}
                                </p>

                                <div className="flex flex-wrap gap-6 text-sm">
                                    {item.grant.max_amount && (
                                        <div className="flex items-center text-gray-700">
                                            <Euro className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="font-medium">Hasta {item.grant.max_amount.toLocaleString('es-ES')} €</span>
                                        </div>
                                    )}

                                    {item.grant.application_deadline && (
                                        <div className="flex items-center text-gray-700">
                                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                            <span>Cierra el {new Date(item.grant.application_deadline).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-gray-700">
                                        <Gift className="w-4 h-4 mr-2 text-purple-600" />
                                        <span className="capitalize">{item.grant.funding_type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {grants.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No hemos encontrado ayudas compatibles</h3>
                            <p className="text-gray-500 mt-2">Prueba a actualizar tu perfil de empresa para mejorar el matching.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
