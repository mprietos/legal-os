import { Database } from '../../types/database';

// Extend generated types with new schema fields
export type Company = Database['public']['Tables']['companies']['Row'] & {
    cnae_code?: string;
    cnae_description?: string;
};

export type Grant = Database['public']['Tables']['grants']['Row'] & {
    regions?: string[];
    permitted_cnae_codes?: string[];
    min_revenue?: number;
    max_revenue?: number;
    estimation_params?: EstimationParams;
};

export type ScoringRule = Database['public']['Tables']['scoring_rules']['Row'] & {
    config?: RuleConfig;
};

export interface RuleConfig {
    exact_match?: boolean;
    multiplier?: number;
    bonus_points?: number;
}

export interface MatchResult {
    company_id: string;
    grant_id: string;
    total_score: number; // 0-100
    match_details: {
        score_breakdown: ScoreComponent[];
        impact_estimation: EconomicEstimation;
        explanations: string[];
    };
}

export interface ScoreComponent {
    rule_type: string;
    score: number; // Points awarded
    max_score: number; // Max possible points for this rule
    reason: string;
}

export interface EconomicEstimation {
    min_amount: number;
    max_amount: number;
    estimated_amount: number;
    confidence: 'high' | 'medium' | 'low';
    currency: string;
}

export interface EstimationParams {
    base_amount?: number;
    per_employee?: number;
    max_cap?: number;
    fixed_amount?: number;
    percentage_of_project?: number; // e.g. 0.80 for 80% coverage
    min_amount?: number;
}
