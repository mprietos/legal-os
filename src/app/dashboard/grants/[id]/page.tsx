'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    ArrowLeft,
    Banknote,
    Calendar,
    CheckCircle2,
    FileText,
    Building2,
    Loader2,
    Download,
    TrendingUp
} from 'lucide-react';
import { PaywallModal } from '@/components/dashboard/paywall-modal';

interface GrantDetail {
    id: string;
    match_score: number;
    status: string;
    company_id: string;
    grant: {
        id: string;
        title: string;
        description: string;
        issuer: string;
        max_amount: number | null;
        funding_type: string;
        application_deadline: string | null;
        requirements: string[] | null;
        documents_needed: string[] | null;
        official_url: string | null;
    };
}

export default function GrantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [item, setItem] = useState<GrantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);

    // Paywall & Status State
    const [paywallOpen, setPaywallOpen] = useState(false);
    const [companyPlan, setCompanyPlan] = useState<string>('free');
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        loadGrantItem();
    }, [params.id]);

    const loadGrantItem = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('company_grants')
                .select(`
          *,
          grant:grants(*),
          company:companies(plan, credits)
        `)
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setItem(data);
            if (data.company) {
                // @ts-ignore
                setCompanyPlan(data.company.plan);
                // @ts-ignore
                setCredits(data.company.credits);
            }
        } catch (error) {
            console.error('Error loading grant item:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateApplication = async () => {
        if (!item) return;

        // Paywall Check
        // Paywall Check - Allow if PRO/Business OR if FREE with credits
        if (companyPlan === 'free' && (credits === null || credits <= 0)) {
            setPaywallOpen(true);
            return;
        }

        setGenerating(true);
        try {
            const response = await fetch('/api/generate-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentType: 'grant_application',
                    grantId: item.grant.id,
                    companyId: item.company_id
                }),
            });

            if (!response.ok) throw new Error('Error generando documento');

            const data = await response.json();
            setGeneratedDoc(data.documentId);

            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
            }

            // Actualizar estado a 'in_progress'

            // Actualizar estado a 'in_progress'
            await supabase
                .from('company_grants')
                .update({ status: 'in_progress' })
                .eq('id', item.id);

            setItem(prev => prev ? { ...prev, status: 'in_progress' } : null);

            // Redirigir a la vista del documento
            router.push('/dashboard/documents');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar la solicitud. Inténtalo de nuevo.');
        } finally {
            setGenerating(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!item) return;
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('company_grants')
                .update({ status: newStatus })
                .eq('id', item.id);

            if (error) throw error;

            console.log(`[Frontend] Grant status updated to ${newStatus}. Refreshing alerts...`);

            // Relanzar alertas
            await fetch('/api/alerts/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: item.company_id })
            });

            setItem(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!item) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al dashboard
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-green-600 to-teal-600 p-8 text-white">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 opacity-90">
                                <Building2 className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.grant.issuer}</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-4">
                                {item.grant.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 mt-6">
                                {item.grant.max_amount && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center">
                                        <Banknote className="w-4 h-4 mr-2" />
                                        <span className="font-semibold">
                                            Hasta {item.grant.max_amount.toLocaleString('es-ES')} €
                                        </span>
                                    </div>
                                )}
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    <span className="font-semibold text-green-100">
                                        {item.match_score}% de compatibilidad
                                    </span>
                                </div>
                                {item.grant.application_deadline && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Plazo: {new Date(item.grant.application_deadline).toLocaleDateString('es-ES')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h3>
                                <div className="prose text-gray-600">
                                    <p>{item.grant.description}</p>
                                </div>
                            </div>

                            {item.grant.requirements && item.grant.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Requisitos</h3>
                                    <ul className="space-y-3">
                                        {item.grant.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {item.grant.documents_needed && item.grant.documents_needed.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Documentación Necesaria</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <ul className="space-y-2">
                                            {item.grant.documents_needed.map((doc, index) => (
                                                <li key={index} className="flex items-center text-gray-700">
                                                    <FileText className="w-4 h-4 text-gray-400 mr-3" />
                                                    {doc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Action */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Gestionar Solicitud
                                </h3>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleGenerateApplication}
                                        disabled={generating || (item.status !== 'opportunity' && item.status !== 'in_progress')}
                                        className={`w-full py-3 px-4 ${companyPlan === 'free' && (credits === null || credits <= 0) && item.status === 'opportunity'
                                            ? 'bg-amber-600 hover:bg-amber-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center transform hover:scale-[1.02]`}
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Generando...
                                            </>
                                        ) : companyPlan === 'free' && (credits === null || credits <= 0) && item.status === 'opportunity' ? (
                                            <>
                                                <TrendingUp className="w-5 h-5 mr-2" />
                                                Pasar a PRO para generar
                                            </>
                                        ) : item.status === 'in_progress' ? (
                                            <>
                                                <FileText className="w-5 h-5 mr-2" />
                                                Ver borrador
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-5 h-5 mr-2" />
                                                Generar Solicitud
                                            </>
                                        )}
                                    </button>

                                    {item.grant.official_url && (
                                        <a
                                            href={item.grant.official_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                                        >
                                            Ver convocatoria oficial
                                        </a>
                                    )}

                                    <div className="text-xs text-center text-gray-500 mt-4">
                                        {companyPlan === 'free' ? (
                                            credits !== null && credits > 0
                                                ? `La IA redactará una memoria técnica personalizada. Te quedan ${credits} créditos.`
                                                : 'Has agotado tus créditos. Pásate a PRO para redactar memorias ilimitadas.'
                                        ) : (
                                            'La IA redactará una memoria técnica personalizada basada en los datos de tu empresa.'
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Estado de la Oportunidad
                                    </label>
                                    <select
                                        value={item.status}
                                        onChange={(e) => updateStatus(e.target.value)}
                                        disabled={updating}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3 border text-gray-900 bg-gray-50"
                                    >
                                        <option value="opportunity">Nueva Oportunidad</option>
                                        <option value="in_progress">En proceso</option>
                                        <option value="submitted">Presentado</option>
                                        <option value="rejected">No solicitado / Rechazado</option>
                                    </select>
                                    <p className="mt-2 text-[10px] text-gray-400">
                                        Cambiar el estado eliminará la alerta del dashboard principal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaywallModal
                isOpen={paywallOpen}
                onClose={() => setPaywallOpen(false)}
                title="Redacción de Subvenciones"
                message="Nuestro asistente redacta la memoria técnica completa por ti, maximizando las opciones de éxito. Disponible en planes Pro."
                potentialValue={item?.grant.max_amount || 0}
            />
        </div>
    );
}
