import { Company, Grant, MatchResult, ScoringRule, ScoreComponent, EconomicEstimation } from './types';

export class MatchingEngine {
    private rules: ScoringRule[];

    constructor(rules: ScoringRule[]) {
        this.rules = rules;
    }

    public evaluate(company: Company, grant: Grant): MatchResult {
        const scoreBreakdown: ScoreComponent[] = [];
        let totalScore = 0;

        // 1. Calculate Score based on Rules
        for (const rule of this.rules) {
            if (!rule.is_active) continue;

            const component = this.evaluateRule(company, grant, rule);
            scoreBreakdown.push(component);
            totalScore += component.score;
        }

        // Cap score at 100
        totalScore = Math.min(100, Math.max(0, totalScore));

        // 2. Economic Estimation
        const impactEstimation = this.estimateImpact(company, grant);

        // 3. Explainability
        const explanations = this.explainMatch(scoreBreakdown, impactEstimation);

        return {
            company_id: company.id,
            grant_id: grant.id,
            total_score: totalScore,
            match_details: {
                score_breakdown: scoreBreakdown,
                impact_estimation: impactEstimation,
                explanations
            }
        };
    }

    private evaluateRule(company: Company, grant: Grant, rule: ScoringRule): ScoreComponent {
        let score = 0;
        const maxScore = rule.weight;
        let reason = '';

        switch (rule.rule_type) {
            case 'sector_match':
                if (grant.sectors && grant.sectors.includes(company.sector)) {
                    score = rule.weight;
                    reason = `Tu sector (${company.sector}) está incluido en la ayuda.`;
                }
                break;

            case 'region_match':
                if (grant.regions && company.region && grant.regions.includes(company.region)) {
                    score = rule.weight;
                    reason = `Tu región (${company.region}) es elegible.`;
                } else if (!grant.regions || grant.regions.length === 0) {
                    // National grant, full points usually or less depending on strategy. 
                    // Let's give full points if it's national and company is in country.
                    score = rule.weight;
                    reason = 'Ayuda de ámbito nacional.';
                }
                break;

            case 'company_size_match':
                if (grant.company_sizes && grant.company_sizes.includes(company.company_size)) {
                    score = rule.weight;
                    reason = `Tu tamaño de empresa (${company.company_size}) encaja con los requisitos.`;
                }
                break;

            case 'cnae_match':
                if (grant.permitted_cnae_codes && company.cnae_code) {
                    if (grant.permitted_cnae_codes.includes(company.cnae_code)) {
                        score = rule.weight;
                        reason = `Tu CNAE (${company.cnae_code}) está explícitamente incluido.`;
                    }
                } else if (!grant.permitted_cnae_codes || grant.permitted_cnae_codes.length === 0) {
                    // If no specific CNAE restriction, maybe partial points or ignore? 
                    // Let's assume neutral if not specified (0 points) or full if "all CNAEs".
                    // Strategy: If specific CNAEs are listed, it's a bonus to match. If not, maybe it's general sector match.
                    // For now, only award if specific match found.
                }
                break;

            case 'financial_match':
                // Check min/max revenue
                let valid = true;
                if (grant.min_revenue && company.annual_revenue && company.annual_revenue < grant.min_revenue) valid = false;
                if (grant.max_revenue && company.annual_revenue && company.annual_revenue > grant.max_revenue) valid = false;

                if (valid) {
                    score = rule.weight;
                    reason = 'Cumples con los requisitos de facturación.';
                }
                break;

            default:
                break;
        }

        return {
            rule_type: rule.rule_type,
            score,
            max_score: maxScore,
            reason: score > 0 ? reason : ''
        };
    }

    private estimateImpact(company: Company, grant: Grant): EconomicEstimation {
        const params = grant.estimation_params || {};
        let estimated = 0;
        let min = 0;
        let max = grant.max_amount || 0;

        // Heuristics
        if (params.fixed_amount) {
            estimated = params.fixed_amount;
            min = params.fixed_amount;
            max = params.fixed_amount;
        } else if (params.base_amount) {
            estimated = params.base_amount;
            if (params.per_employee && company.employee_count) {
                estimated += params.per_employee * company.employee_count;
            }
        } else {
            // Fallback: Use max_amount or a default heuristic
            estimated = max;
        }

        // Apply caps
        if (params.max_cap) {
            max = Math.min(max, params.max_cap);
            estimated = Math.min(estimated, max);
        }
        if (grant.max_amount) {
            estimated = Math.min(estimated, grant.max_amount);
        }

        // Safety
        if (estimated === 0 && max > 0) estimated = max;

        return {
            min_amount: min,
            max_amount: max,
            estimated_amount: estimated,
            confidence: 'medium', // static for now
            currency: 'EUR'
        };
    }

    private explainMatch(scoreBreakdown: ScoreComponent[], impact: EconomicEstimation): string[] {
        const explanations: string[] = [];

        // Add reasons for scored components
        scoreBreakdown.forEach(comp => {
            if (comp.score > 0 && comp.reason) {
                explanations.push(comp.reason);
            }
        });

        // Add economic hook
        if (impact.estimated_amount > 0) {
            const formatted = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(impact.estimated_amount);
            explanations.push(`Estimamos que podrías recibir hasta ${formatted}.`);
        }

        // Urgency hook
        // (Could be added if we passed the grant date context)

        return explanations;
    }
}
