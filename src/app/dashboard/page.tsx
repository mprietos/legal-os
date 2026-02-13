'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  LogOut,
  FileText,
  TrendingUp,
  Building2,
  Gift,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { AlertsFeed } from '@/components/dashboard/alerts-feed';
import DebtsTab from '@/components/dashboard/DebtsTab';
import { DashboardLogo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ComplianceScoreCard } from '@/components/compliance/ComplianceScore';
import { ComplianceTaskCard, ComplianceTasksEmptyState } from '@/components/compliance/ComplianceTaskCard';
import { GrantCard } from '@/components/grants/GrantCard';

interface DashboardData {
  company: any;
  complianceItems: any[];
  grants: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'debts'>('overview');

  useEffect(() => {
    router.refresh();
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Obtener empresa del usuario
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!companies) {
        router.push('/onboarding');
        return;
      }

      // Obtener requisitos de compliance
      const { data: complianceData } = await supabase
        .from('company_compliance')
        .select(`
          *,
          requirement:compliance_requirements(*)
        `)
        .eq('company_id', companies.id)
        .order('priority', { ascending: false })
        .limit(10);

      // Obtener subvenciones
      const { data: grantsData } = await supabase
        .from('company_grants')
        .select(`
          *,
          grant:grants(*)
        `)
        .eq('company_id', companies.id)
        .order('match_score', { ascending: false })
        .limit(5);

      setData({
        company: companies,
        complianceItems: complianceData || [],
        grants: grantsData || [],
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-os-glass">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { company, complianceItems, grants } = data;
  const score = company.compliance_score || 0;

  return (
    <div className="min-h-screen bg-os-glass">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-os">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DashboardLogo href="/dashboard" />
              <div className="border-l border-gray-200 pl-4">
                <h1 className="text-xl font-bold text-os-obsidian">Compliance OS</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">{company.name}</p>
                  {company.plan === 'free' && (
                    <Badge variant="info" size="sm">
                      {company.credits ?? 0} créditos gratuitos
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertsFeed />

        {/* Compliance Score Card - Nuevo componente */}
        <div className="mb-8 animate-fade-in">
          <ComplianceScoreCard
            score={score}
            previousScore={company.previous_compliance_score}
            title="Compliance Score"
            subtitle="Estado de cumplimiento normativo de tu empresa"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'debts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Deudas y Sanciones
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="bento-grid animate-fade-in md:grid-cols-2">
            {/* Tareas de Compliance */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-os-lg shadow-os-md p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-os-obsidian">
                    Tareas de Compliance
                  </h2>
                  <AlertTriangle className="w-6 h-6 text-compliance-warning-text icon-linear" />
                </div>

                {complianceItems.length === 0 ? (
                  <ComplianceTasksEmptyState />
                ) : (
                  <div className="space-y-4">
                    {complianceItems.map((item) => (
                      <ComplianceTaskCard
                        key={item.id}
                        id={item.id}
                        requirement={item.requirement}
                        status={item.status}
                        dueDate={item.due_date}
                        onViewDetails={() => router.push(`/dashboard/compliance/${item.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subvenciones disponibles */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-os-lg shadow-os-md p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-os-obsidian">
                    Subvenciones Disponibles
                  </h2>
                  <Gift className="w-6 h-6 text-compliance-success-text icon-linear" />
                </div>

                {grants.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-primary-500" />
                    <h3 className="text-lg font-semibold text-os-obsidian mb-2">
                      Buscando oportunidades
                    </h3>
                    <p className="text-gray-600">
                      Analizando subvenciones disponibles para tu empresa...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grants.map((item) => (
                      <GrantCard
                        key={item.id}
                        grant={item.grant}
                        matchScore={item.match_score}
                        status={item.status}
                        onApply={() => router.push(`/dashboard/grants/${item.id}`)}
                        onViewDetails={() => router.push(`/dashboard/grants/${item.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DebtsTab companyId={company.id} />
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/dashboard/documents')}
            className="bento-card text-left group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-os-lg group-hover:bg-primary-100 transition-colors">
                <FileText className="w-8 h-8 text-primary-600 icon-linear" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-os-obsidian group-hover:text-primary-600 transition-colors">
                  Generar Documentos
                </h3>
                <p className="text-sm text-gray-600">
                  Crea documentos de compliance con IA
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/grants')}
            className="bento-card text-left group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-compliance-success-bg rounded-os-lg group-hover:bg-compliance-success-border transition-colors">
                <TrendingUp className="w-8 h-8 text-compliance-success-text icon-linear" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-os-obsidian group-hover:text-compliance-success-text transition-colors">
                  Ver todas las ayudas
                </h3>
                <p className="text-sm text-gray-600">
                  Explora más oportunidades de financiación
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="bento-card text-left group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-50 rounded-os-lg group-hover:bg-secondary-100 transition-colors">
                <Building2 className="w-8 h-8 text-secondary-500 icon-linear" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-os-obsidian group-hover:text-secondary-600 transition-colors">
                  Configurar Empresa
                </h3>
                <p className="text-sm text-gray-600">
                  Actualiza los datos de tu empresa
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
