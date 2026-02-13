'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  LogOut,
  Building2,
  Gift,
  AlertCircle,
} from 'lucide-react';

interface DashboardData {
  company: any;
  complianceItems: any[];
  grants: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-red-100 text-red-800' },
      in_progress: { label: 'En proceso', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { company, complianceItems, grants } = data;
  const score = company.compliance_score || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legal OS</h1>
                <p className="text-sm text-gray-600">{company.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Compliance Score
              </h2>
              <p className="text-gray-600 text-sm">
                Estado de cumplimiento normativo de tu empresa
              </p>
            </div>
            <div className={`flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(score)}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className={`text-xs ${getScoreColor(score)}`}>/ 100</div>
              </div>
            </div>
          </div>

          {/* Semáforo visual */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
            <div className="ml-4 text-sm font-medium">
              {score >= 80 && <span className="text-green-600">Excelente</span>}
              {score >= 60 && score < 80 && <span className="text-yellow-600">Mejorable</span>}
              {score < 60 && <span className="text-red-600">Requiere atención</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tareas de Compliance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Tareas de Compliance
              </h2>
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>

            {complianceItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p>¡Todo en orden! No hay tareas pendientes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start">
                        {getSeverityIcon(item.requirement.severity)}
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900">
                            {item.requirement.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.requirement.description}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {item.due_date && (
                      <div className="flex items-center text-sm text-gray-500 mt-3">
                        <Clock className="w-4 h-4 mr-1" />
                        Vencimiento: {new Date(item.due_date).toLocaleDateString('es-ES')}
                      </div>
                    )}

                    <div className="mt-3">
                      <button
                        onClick={() => router.push(`/dashboard/compliance/${item.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subvenciones disponibles */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Subvenciones Disponibles
              </h2>
              <Gift className="w-6 h-6 text-green-600" />
            </div>

            {grants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <p>Buscando oportunidades para tu empresa...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {grants.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.grant.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.grant.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-green-600">
                          {item.match_score}% match
                        </div>
                      </div>
                    </div>

                    {item.grant.max_amount && (
                      <div className="flex items-center text-sm font-medium text-gray-900 mt-3">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        Hasta {item.grant.max_amount.toLocaleString('es-ES')} €
                      </div>
                    )}

                    {item.grant.application_deadline && (
                      <div className="text-sm text-gray-500 mt-2">
                        Plazo: {new Date(item.grant.application_deadline).toLocaleDateString('es-ES')}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/grants/${item.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Generar solicitud con IA →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/dashboard/documents')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Generar Documentos</h3>
            <p className="text-sm text-blue-100">Crea documentos de compliance con IA</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/grants')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <TrendingUp className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Ver todas las ayudas</h3>
            <p className="text-sm text-green-100">Explora más oportunidades de financiación</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-left"
          >
            <Building2 className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Configurar Empresa</h3>
            <p className="text-sm text-purple-100">Actualiza los datos de tu empresa</p>
          </button>
        </div>
      </main>
    </div>
  );
}
