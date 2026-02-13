'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Clock,
    FileText,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { PaywallModal } from '@/components/dashboard/paywall-modal';

interface ComplianceDetail {
    id: string;
    status: string;
    priority: number;
    due_date: string | null;
    notes: string | null;
    company_id: string;
    requirement: {
        id: string;
        title: string;
        description: string;
        category: string;
        severity: string;
        frequency: string | null;
        action_steps: string[] | null;
        links: { title: string; url: string }[] | null;
        estimated_time: number | null;
    };
}

export default function ComplianceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [item, setItem] = useState<ComplianceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Paywall State
    const [paywallOpen, setPaywallOpen] = useState(false);
    const [companyPlan, setCompanyPlan] = useState<string>('free');

    useEffect(() => {
        loadComplianceItem();
    }, [params.id]);

    const loadComplianceItem = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('company_compliance')
                .select(`
          *,
          requirement:compliance_requirements(*),
          company:companies(plan)
        `)
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setItem(data);
            if (data.company) {
                // @ts-ignore
                setCompanyPlan(data.company.plan);
            }
        } catch (error) {
            console.error('Error loading compliance item:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateGuide = async () => {
        if (!item) return;

        // Paywall Check
        if (companyPlan !== 'pro' && companyPlan !== 'business') {
            setPaywallOpen(true);
            return;
        }

        setGenerating(true);
        try {
            const response = await fetch('/api/generate-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentType: 'action_guide',
                    requirementId: item.requirement.id,
                    companyId: item.company_id
                }),
            });

            if (!response.ok) throw new Error('Error generando documento');

            await response.json();

            // Redirigir a la vista de documentos
            router.push('/dashboard/documents');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar la guía. Inténtalo de nuevo.');
        } finally {
            setGenerating(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('company_compliance')
                .update({ status: newStatus })
                .eq('id', params.id);

            if (error) throw error;
            if (!item) return;

            console.log(`[Frontend] Status updated to ${newStatus} for ${params.id}. Triggering recalculation...`);

            // Recalcular el score de la empresa
            const scoreResponse = await fetch('/api/compliance/recalculate-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: item.company_id })
            });

            if (!scoreResponse.ok) {
                const errorData = await scoreResponse.json();
                console.error('[Frontend] Recalculate API failed:', errorData);
            } else {
                const scoreData = await scoreResponse.json();
                console.log('[Frontend] Recalculate API success:', scoreData);
            }

            // Relanzar alertas
            console.log(`[Frontend] Refreshing alerts for company: ${item.company_id}`);
            await fetch('/api/alerts/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: item.company_id })
            });

            setItem(prev => prev ? { ...prev, status: newStatus } : null);

            // Forzar una recarga ligera del dashboard en segundo plano si es posible
            // router.refresh(); // Ya lo hace el dashboard al montar, pero podríamos dispararlo aquí también
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al dashboard
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${item.requirement.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                                            item.requirement.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                'bg-blue-100 text-blue-800 border-blue-200'}`}
                                    >
                                        {item.requirement.severity?.toUpperCase()}
                                    </span>
                                    <span className="text-sm text-gray-500 capitalize">
                                        {item.requirement.category.replace('_', ' ')}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {item.requirement.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.status === 'completed' ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        Completado
                                    </span>
                                ) : (
                                    <select
                                        value={item.status}
                                        onChange={(e) => updateStatus(e.target.value)}
                                        disabled={updating}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900"
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="in_progress">En proceso</option>
                                        <option value="completed">Completado</option>
                                        <option value="not_applicable">No aplica</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-600 mt-2">{item.requirement.description}</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Action Steps */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                                    Pasos para cumplir
                                </h3>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    {item.requirement.action_steps && item.requirement.action_steps.length > 0 ? (
                                        <ul className="space-y-3">
                                            {item.requirement.action_steps.map((step, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-gray-700">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic">No hay pasos específicos definidos.</p>
                                    )}
                                </div>
                            </div>

                            {/* Resources */}
                            {item.requirement.links && item.requirement.links.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                                        Recursos y Enlaces
                                    </h3>
                                    <div className="space-y-2">
                                        {item.requirement.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                                        {link.title}
                                                    </span>
                                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar info */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">Detalles</h4>

                                <div className="space-y-4">
                                    {item.due_date && (
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Vencimiento</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(item.due_date).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {item.requirement.estimated_time && (
                                        <div className="flex items-start">
                                            <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Tiempo estimado</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.requirement.estimated_time} minutos
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {item.requirement.frequency && (
                                        <div className="flex items-start">
                                            <AlertCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Frecuencia</p>
                                                <p className="text-sm font-medium text-gray-900 capitalize">
                                                    {item.requirement.frequency}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    ¿Necesitas ayuda?
                                </h4>
                                <p className="text-sm text-indigo-700 mb-3">
                                    Podemos generar una guía de acción detallada y personalizada.
                                </p>
                                <button
                                    onClick={handleGenerateGuide}
                                    disabled={generating}
                                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center font-bold"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4 mr-2" />
                                            Generar Guía de Acción
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <PaywallModal
                    isOpen={paywallOpen}
                    onClose={() => setPaywallOpen(false)}
                    title="Guía de Acción con IA"
                    message="Genera guías paso a paso personalizadas para tu empresa al instante. Disponible en planes Pro."
                    potentialValue={item?.requirement.severity === 'critical' ? 7500 : 3000}
                />
            </div>
        </div>
    );
}
