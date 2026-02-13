'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AlertTriangle, Clock, TrendingUp, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { Alert } from '@/lib/alerts/engine';
import { PaywallModal } from './paywall-modal';

export function AlertsFeed() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [paywallOpen, setPaywallOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [companyInfo, setCompanyInfo] = useState<{ plan: string, credits: number } | null>(null);

    useEffect(() => {
        loadAlerts();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('alerts-feed')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
                loadAlerts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadAlerts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user's companies first
            const { data: companies } = await supabase
                .from('companies')
                .select('id, plan, credits')
                .eq('owner_id', user.id);

            if (!companies?.length) return;

            setCompanyInfo({
                plan: companies[0].plan,
                credits: companies[0].credits
            });

            const companyIds = companies.map(c => c.id);

            const { data } = await supabase
                .from('alerts')
                .select('*')
                .in('company_id', companyIds)
                .eq('status', 'pending')
                // Order by severity/custom logic implies backend sort, but we can sort client side too
                // Prioritize: Critical > High > Opportunity > Medium > Low
                .order('economic_impact', { ascending: false });

            if (data) {
                // Custom sort to match "Risk First" philoshophy
                const sorted = (data as Alert[]).sort((a, b) => {
                    const score = (alert: Alert) => {
                        if (alert.risk_level === 'critical') return 1000;
                        if (alert.risk_level === 'high') return 500;
                        if (alert.risk_level === 'opportunity') return 300; // Opportunities are important too
                        if (alert.risk_level === 'medium') return 100;
                        return 0;
                    };
                    return score(b) - score(a);
                });
                setAlerts(sorted);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (alert: Alert) => {
        if (alert.is_premium && companyInfo?.plan === 'free') {
            setSelectedAlert(alert);
            setPaywallOpen(true);
        } else {
            router.push(alert.cta_target);
        }
    };

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-lg"></div>;

    if (alerts.length === 0) return null; // Don't show if empty

    return (
        <>
            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Atención Requerida
                </h2>

                <div className="grid gap-4">
                    {alerts.map((alert) => (
                        <div
                            key={`${alert.source_type}-${alert.source_id}`}
                            className={`
                relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md
                ${alert.risk_level === 'critical' ? 'bg-red-50 border-red-200' : ''}
                ${alert.risk_level === 'high' ? 'bg-orange-50 border-orange-200' : ''}
                ${alert.risk_level === 'opportunity' ? 'bg-green-50 border-green-200' : ''}
                ${alert.risk_level === 'medium' || alert.risk_level === 'low' ? 'bg-white border-gray-200' : ''}
              `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {alert.risk_level === 'critical' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800">CRÍTICO</span>}
                                        {alert.risk_level === 'opportunity' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-200 text-green-800 uppercase">Oportunidad</span>}

                                        {alert.deadline_label && (
                                            <span className="flex items-center text-xs font-medium text-gray-600">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {alert.deadline_label}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{alert.description}</p>

                                    {alert.economic_impact > 0 && (
                                        <div className="mt-3 flex items-center gap-2">
                                            {alert.impact_type === 'fine_risk' ? (
                                                <span className="text-red-700 font-bold bg-red-100 px-2 py-1 rounded text-sm">
                                                    -{alert.economic_impact.toLocaleString('es-ES')}€ Riesgo de multa
                                                </span>
                                            ) : (
                                                <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded text-sm">
                                                    +{alert.economic_impact.toLocaleString('es-ES')}€ Potenciales
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <button
                                        onClick={() => handleAction(alert)}
                                        className={`
                       flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all
                       ${alert.risk_level === 'critical' || alert.risk_level === 'high'
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : alert.risk_level === 'opportunity'
                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }
                     `}
                                    >
                                        {alert.is_premium && <Lock className="w-3 h-3 mr-1.5 opacity-80" />}
                                        {alert.cta_label}
                                        {!alert.is_premium && <ArrowRight className="w-4 h-4 ml-1.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <PaywallModal
                isOpen={paywallOpen}
                onClose={() => setPaywallOpen(false)}
                title={selectedAlert?.title || ''}
                message={selectedAlert?.teaser_message || null}
                potentialValue={selectedAlert?.economic_impact}
                credits={companyInfo?.credits}
                onUseCredit={() => {
                    if (selectedAlert) {
                        setPaywallOpen(false);
                        router.push(selectedAlert.cta_target);
                    }
                }}
            />
        </>
    );
}
