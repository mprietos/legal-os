import { supabaseAdmin } from './supabase/server';
import { Database } from '@/types/database';

type Company = Database['public']['Tables']['companies']['Row'];
type ComplianceRequirement = Database['public']['Tables']['compliance_requirements']['Row'];
type Grant = Database['public']['Tables']['grants']['Row'];

interface MatchResult {
  requirementId: string;
  priority: number;
  dueDate?: string;
}

interface GrantMatchResult {
  grantId: string;
  matchScore: number;
}

export class MatchingEngine {
  /**
   * Evalúa compliance y ayudas para una empresa
   */
  static async evaluateCompany(companyId: string): Promise<{
    complianceMatches: MatchResult[];
    grantMatches: GrantMatchResult[];
    complianceScore: number;
  }> {
    // Obtener datos de la empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Empresa no encontrada');
    }

    // Obtener requisitos de compliance aplicables
    const complianceMatches = await this.matchComplianceRequirements(company);

    // Obtener subvenciones aplicables
    const grantMatches = await this.matchGrants(company);

    // Calcular compliance score inicial (todos pendientes al inicio)
    const complianceScore = this.calculateComplianceScore(0, complianceMatches.length);

    return {
      complianceMatches,
      grantMatches,
      complianceScore,
    };
  }

  /**
   * Encuentra requisitos de compliance aplicables a la empresa
   */
  private static async matchComplianceRequirements(company: Company): Promise<MatchResult[]> {
    const { data: requirements, error } = await supabaseAdmin
      .from('compliance_requirements')
      .select('*');

    if (error || !requirements) {
      throw new Error('Error al obtener requisitos de compliance');
    }

    const matches: MatchResult[] = [];

    for (const req of requirements) {
      if (this.isRequirementApplicable(req, company)) {
        const priority = this.calculatePriority(req);
        const dueDate = this.calculateDueDate(req);

        matches.push({
          requirementId: req.id,
          priority,
          dueDate,
        });
      }
    }

    // Ordenar por prioridad (críticos primero)
    return matches.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Encuentra subvenciones aplicables a la empresa
   */
  private static async matchGrants(company: Company): Promise<GrantMatchResult[]> {
    const { data: grants, error } = await supabaseAdmin
      .from('grants')
      .select('*')
      .eq('is_active', true);

    if (error || !grants) {
      throw new Error('Error al obtener subvenciones');
    }

    const matches: GrantMatchResult[] = [];

    for (const grant of grants) {
      const matchScore = this.calculateGrantMatchScore(grant, company);

      if (matchScore > 0) {
        matches.push({
          grantId: grant.id,
          matchScore,
        });
      }
    }

    // Ordenar por score (mejores matches primero)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Verifica si un requisito es aplicable a la empresa
   */
  private static isRequirementApplicable(
    req: ComplianceRequirement,
    company: Company
  ): boolean {
    // Verificar país
    if (req.countries.length > 0 && !req.countries.includes(company.country)) {
      return false;
    }

    // Verificar sector (si está especificado)
    if (req.sectors.length > 0 &&
      !req.sectors.includes('todos') &&
      !req.sectors.includes(company.sector)) {
      return false;
    }

    // Verificar tamaño de empresa
    if (req.company_sizes.length > 0 &&
      !req.company_sizes.includes(company.company_size)) {
      return false;
    }

    return true;
  }

  /**
   * Calcula el score de match para una subvención
   */
  private static calculateGrantMatchScore(grant: Grant, company: Company): number {
    let score = 0;

    // Verificar país (requisito obligatorio)
    if (grant.countries.length > 0 && !grant.countries.includes(company.country)) {
      return 0;
    }
    score += 30;

    // Verificar sector
    if (grant.sectors.length > 0) {
      if (grant.sectors.includes('todos') || grant.sectors.includes(company.sector)) {
        score += 30;
      } else {
        return 0; // No aplica si el sector no coincide
      }
    } else {
      score += 20;
    }

    // Verificar tamaño de empresa
    if (grant.company_sizes.length > 0) {
      if (grant.company_sizes.includes(company.company_size)) {
        score += 25;
      } else {
        return 0;
      }
    } else {
      score += 15;
    }

    // Verificar número de empleados
    if (company.employee_count !== null) {
      if (grant.min_employees !== null && company.employee_count < grant.min_employees) {
        return 0;
      }
      if (grant.max_employees !== null && company.employee_count > grant.max_employees) {
        return 0;
      }
      score += 15;
    } else {
      score += 5;
    }

    // Verificar si está dentro del plazo
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      const now = new Date();
      if (deadline < now) {
        return 0; // Fuera de plazo
      }
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Calcula prioridad basada en severidad
   */
  private static calculatePriority(req: ComplianceRequirement): number {
    const severityMap: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
    };

    return severityMap[req.severity] || 1;
  }

  /**
   * Calcula fecha de vencimiento para requisitos recurrentes
   */
  private static calculateDueDate(req: ComplianceRequirement): string | undefined {
    if (!req.is_recurring || !req.frequency) {
      return undefined;
    }

    const now = new Date();
    let dueDate = new Date(now);

    switch (req.frequency) {
      case 'monthly':
        dueDate.setMonth(now.getMonth() + 1);
        dueDate.setDate(20); // Día 20 de cada mes
        break;
      case 'quarterly':
        dueDate.setMonth(now.getMonth() + 3);
        dueDate.setDate(20);
        break;
      case 'annual':
        dueDate.setFullYear(now.getFullYear() + 1);
        dueDate.setMonth(3); // Abril (mes 3)
        dueDate.setDate(30);
        break;
    }

    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Calcula el compliance score de 0 a 100
   */
  private static calculateComplianceScore(completedCount: number, totalCount: number): number {
    if (totalCount === 0) return 100;

    // Score basado en porcentaje de completado
    // Podríamos dar un peso extra al onboarding, pero lo más intuitivo es el % de tareas
    return Math.round((completedCount / totalCount) * 100);
  }

  /**
   * Recalcula el compliance score para una empresa basándose en el estado actual de sus tareas
   */
  static async recalculateCompanyScore(companyId: string): Promise<number> {
    console.log(`[MatchingEngine] Recalculating score for company: ${companyId}`);
    const { data: items, error } = await supabaseAdmin
      .from('company_compliance')
      .select('status')
      .eq('company_id', companyId);

    if (error || !items) {
      console.error(`[MatchingEngine] Error fetching compliance items:`, error);
      throw new Error('Error al obtener estados de compliance');
    }

    const totalCount = items.length;
    const completedCount = items.filter(
      item => item.status === 'completed' || item.status === 'not_applicable'
    ).length;

    console.log(`[MatchingEngine] Stats - Total: ${totalCount}, Completed: ${completedCount}`);

    const newScore = this.calculateComplianceScore(completedCount, totalCount);
    console.log(`[MatchingEngine] New calculated score: ${newScore}`);

    // Actualizar empresa
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        compliance_score: newScore,
        last_score_update: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) {
      throw updateError;
    }

    return newScore;
  }

  /**
   * Guarda los resultados del matching en la base de datos
   */
  static async saveMatchingResults(
    companyId: string,
    results: {
      complianceMatches: MatchResult[];
      grantMatches: GrantMatchResult[];
      complianceScore: number;
    }
  ): Promise<void> {
    // Guardar compliance matches
    const complianceInserts = results.complianceMatches.map((match) => ({
      company_id: companyId,
      requirement_id: match.requirementId,
      status: 'pending' as const,
      priority: match.priority,
      due_date: match.dueDate,
    }));

    if (complianceInserts.length > 0) {
      const { error: complianceError } = await supabaseAdmin
        .from('company_compliance')
        .upsert(complianceInserts, {
          onConflict: 'company_id,requirement_id',
        });

      if (complianceError) {
        console.error('Error al guardar compliance matches:', complianceError);
      }
    }

    // Guardar grant matches
    const grantInserts = results.grantMatches.map((match) => ({
      company_id: companyId,
      grant_id: match.grantId,
      match_score: match.matchScore,
      status: 'opportunity' as const,
    }));

    if (grantInserts.length > 0) {
      const { error: grantError } = await supabaseAdmin
        .from('company_grants')
        .upsert(grantInserts, {
          onConflict: 'company_id,grant_id',
        });

      if (grantError) {
        console.error('Error al guardar grant matches:', grantError);
      }
    }

    // Actualizar compliance score de la empresa
    const { error: scoreError } = await supabaseAdmin
      .from('companies')
      .update({
        compliance_score: results.complianceScore,
        last_score_update: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (scoreError) {
      console.error('Error al actualizar compliance score:', scoreError);
    }
  }
}
