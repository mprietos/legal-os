import { supabaseAdmin } from '@/lib/supabase/server';
import { Database } from '@/types/database';

// Types derived from Database
type ComplianceRequirement = Database['public']['Tables']['compliance_requirements']['Row'];
type CompanyCompliance = Database['public']['Tables']['company_compliance']['Row'];
type CompanyGrant = Database['public']['Tables']['company_grants']['Row'] & {
    match_data?: any;
};
type Grant = Database['public']['Tables']['grants']['Row'];

export interface Alert {
    company_id: string;
    source_type: 'compliance' | 'grant';
    source_id: string;
    title: string;
    description: string;
    risk_level: 'critical' | 'high' | 'medium' | 'low' | 'opportunity';
    economic_impact: number;
    impact_type: 'fine_risk' | 'potential_income';
    deadline: string | null;
    deadline_label: string | null;
    cta_action: string;
    cta_target: string;
    cta_label: string;
    status: 'pending' | 'in_progress';
    is_premium: boolean;
    teaser_message: string | null;
}

export class AlertsEngine {

    /**
     * Main entry point to generate alerts for a specific company
     */
    static async generateAlertsForCompany(companyId: string) {
        console.log(`[AlertsEngine] Syncing alerts for company: ${companyId}`);
        const alerts: Alert[] = [];

        // 1. Generate new valid alerts
        const complianceAlerts = await this.processCompliance(companyId);
        alerts.push(...complianceAlerts);

        const grantAlerts = await this.processGrants(companyId);
        alerts.push(...grantAlerts);

        // 2. Clear ALL existing alerts for this company
        // This is the most robust way to ensure no "completed" items remain
        const { error: deleteError } = await supabaseAdmin
            .from('alerts')
            .delete()
            .eq('company_id', companyId);

        if (deleteError) {
            console.error('[AlertsEngine] Error clearing alerts:', deleteError);
            throw deleteError;
        }

        // 3. Insert fresh valid alerts
        if (alerts.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('alerts')
                .insert(alerts);

            if (insertError) {
                console.error('[AlertsEngine] Error inserting fresh alerts:', insertError);
                throw insertError;
            }
        }

        console.log(`[AlertsEngine] Sync complete. ${alerts.length} alerts active.`);
        return alerts.length;
    }

    /**
     * Process Compliance Items -> Alerts
     */
    private static async processCompliance(companyId: string): Promise<Alert[]> {
        // Fetch pending compliance items with their requirements
        const { data: items, error } = await supabaseAdmin
            .from('company_compliance')
            .select(`
                *,
                requirement:compliance_requirements(*)
            `)
            .eq('company_id', companyId)
            .neq('status', 'completed');

        if (error || !items) return [];

        const alerts: Alert[] = [];

        for (const item of items) {
            const requirement = item.requirement as ComplianceRequirement;
            if (!requirement) continue;

            // Determine Risk Level
            let riskLevel: Alert['risk_level'] = 'medium';
            if (requirement.severity === 'critical') riskLevel = 'critical';
            else if (requirement.severity === 'high') riskLevel = 'high';
            else if (requirement.severity === 'low') riskLevel = 'low';

            // Calculate Deadline Urgency
            const daysRemaining = item.due_date ? this.getDaysRemaining(item.due_date) : null;

            // Escalate risk if deadline is close
            if (daysRemaining !== null && daysRemaining <= 7 && riskLevel !== 'critical') {
                riskLevel = 'high';
            }
            if (daysRemaining !== null && daysRemaining <= 3) {
                riskLevel = 'critical';
            }

            // Economic Impact (Mock logic - in real app could be in DB)
            // Critical compliance often implies high fines
            let impact = 0;
            switch (requirement.severity) {
                case 'critical': impact = 7500; break;
                case 'high': impact = 3000; break;
                case 'medium': impact = 1000; break;
                default: impact = 0;
            }

            alerts.push({
                company_id: companyId,
                source_type: 'compliance',
                source_id: item.id,
                title: requirement.title,
                description: requirement.description,
                risk_level: riskLevel,
                economic_impact: impact,
                impact_type: 'fine_risk',
                deadline: item.due_date,
                deadline_label: this.formatDeadlineLabel(daysRemaining),
                cta_action: 'generate_document',
                cta_target: `/dashboard/compliance/${item.id}`,
                cta_label: 'Resolver riesgo ahora',
                status: 'pending',
                is_premium: riskLevel === 'critical' || riskLevel === 'high', // Premium for high risk
                teaser_message: `Evita sanciones de hasta ${impact}€. Genera la documentación necesaria en 1 clic.`
            });
        }

        return alerts;
    }

    /**
     * Process Grant Opportunities -> Alerts
     */
    private static async processGrants(companyId: string): Promise<Alert[]> {
        // Fetch grants with status 'opportunity'
        const { data: items, error } = await supabaseAdmin
            .from('company_grants')
            .select(`
                *,
                grant:grants(*)
            `)
            .eq('company_id', companyId)
            .eq('status', 'opportunity');

        if (error || !items) return [];

        const alerts: Alert[] = [];

        for (const item of items) {
            const grant = item.grant as Grant;
            if (!grant) continue;

            const matchData = item.match_data as any; // Type assertion for JSONB

            // Only alert for high match scores or high amounts
            if ((item.match_score || 0) < 50) continue;

            // Calculate Impact (Potential Income)
            // Prefer estimated amount from match engine, fallback to grant max amount
            const estimatedAmount = matchData?.impact_estimation?.estimated_amount || grant.max_amount || 0;

            const daysRemaining = grant.application_deadline ? this.getDaysRemaining(grant.application_deadline) : null;

            alerts.push({
                company_id: companyId,
                source_type: 'grant',
                source_id: item.id,
                title: `Oportunidad: ${grant.title}`,
                description: `Subvención detectada con un match del ${item.match_score}%`,
                risk_level: 'opportunity',
                economic_impact: estimatedAmount,
                impact_type: 'potential_income',
                deadline: grant.application_deadline,
                deadline_label: this.formatDeadlineLabel(daysRemaining),
                cta_action: 'request_help',
                cta_target: `/dashboard/grants/${item.id}`,
                cta_label: 'Solicitar ayuda',
                status: 'pending',
                is_premium: estimatedAmount > 2000, // Premium for high value grants
                teaser_message: `Hemos detectado ${estimatedAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} potenciales. Desbloquea el asistente para solicitarlos.`
            });
        }

        return alerts;
    }

    // Helper: Days remaining
    private static getDaysRemaining(dateString: string): number {
        const target = new Date(dateString);
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }

    // Helper: Format label
    private static formatDeadlineLabel(days: number | null): string | null {
        if (days === null) return null;
        if (days < 0) return 'Vencido';
        if (days === 0) return 'Vence hoy';
        if (days === 1) return 'Mañana';
        if (days <= 7) return `${days} días restantes`;
        return null;
    }
}
