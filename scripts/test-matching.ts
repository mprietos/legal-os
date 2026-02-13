import { MatchingEngine } from '../src/lib/matching/engine';
import { Company, Grant, ScoringRule } from '../src/lib/matching/types';

// Mock Data
const mockCompany: Company = {
    id: 'comp-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cif_nif: 'B12345678',
    name: 'Tech Solutions SL',
    email: 'info@tech.com',
    country: 'ES',
    region: 'Madrid',
    sector: 'Technology',
    company_size: 'small',
    employee_count: 15,
    annual_revenue: 500000,
    compliance_score: 80,
    last_score_update: new Date().toISOString(),
    plan: 'pro',
    owner_id: 'user-1',
    managed_by: null,
    cnae_code: '6201',
    cnae_description: 'Actividades de programación informática'
};

const mockGrant: Grant = {
    id: 'grant-456',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Kit Digital - Segmento II',
    description: 'Ayuda para la digitalización de pequeñas empresas.',
    issuer: 'Red.es',
    countries: ['ES'],
    sectors: ['Technology', 'Services', 'Retail'], // Broad sectors
    company_sizes: ['small', 'micro'],
    min_employees: 3,
    max_employees: 49,
    max_amount: 6000,
    funding_type: 'grant',
    application_start: '2023-01-01',
    application_deadline: '2025-12-31',
    is_active: true,
    requirements: {},
    documents_needed: {},
    official_url: 'https://...',
    application_url: 'https://...',
    regions: ['Madrid', 'Catalonia'], // Only for these regions
    permitted_cnae_codes: [], // Any
    min_revenue: 0,
    max_revenue: 10000000,
    estimation_params: {
        base_amount: 2000,
        per_employee: 500, // 2000 + 15*500 = 9500 (capped at 6000)
        max_cap: 6000
    }
};

const mockRules: ScoringRule[] = [
    { id: 'r1', created_at: '', rule_type: 'sector_match', weight: 40, config: {}, is_active: true, description: '' },
    { id: 'r2', created_at: '', rule_type: 'company_size_match', weight: 20, config: {}, is_active: true, description: '' },
    { id: 'r3', created_at: '', rule_type: 'region_match', weight: 15, config: {}, is_active: true, description: '' },
    { id: 'r4', created_at: '', rule_type: 'cnae_match', weight: 15, config: {}, is_active: true, description: '' },
    { id: 'r5', created_at: '', rule_type: 'financial_match', weight: 10, config: {}, is_active: true, description: '' },
];

// Run Engine
const engine = new MatchingEngine(mockRules);
console.log('Running Matching Engine...');
console.log(`Company: ${mockCompany.name} (${mockCompany.region}, ${mockCompany.company_size})`);
console.log(`Grant: ${mockGrant.title}`);

const result = engine.evaluate(mockCompany, mockGrant);

console.log('\n--- Match Result ---');
console.log(`Total Score: ${result.total_score}/100`);
console.log('Breakdown:');
result.match_details.score_breakdown.forEach(c => {
    console.log(`- ${c.rule_type}: ${c.score}/${c.max_score} (${c.reason})`);
});
console.log('\nEstimation:');
console.log(`Estimated Amount: ${result.match_details.impact_estimation.estimated_amount} EUR`);
console.log('Explanations:');
result.match_details.explanations.forEach(e => console.log(`> ${e}`));

if (result.total_score > 50) {
    console.log('\n✅ ELIGIBLE');
} else {
    console.log('\n❌ NOT ELIGIBLE');
}
