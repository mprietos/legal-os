import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { MatchingEngine } from '@/lib/matching/engine';
import { Company, Grant, ScoringRule } from '@/lib/matching/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Fetch Scoring Rules
        const { data: rules, error: rulesError } = await supabaseAdmin
            .from('scoring_rules')
            .select('*')
            .eq('is_active', true);

        if (rulesError) throw rulesError;

        // 2. Fetch Active Grants
        const { data: grants, error: grantsError } = await supabaseAdmin
            .from('grants')
            .select('*')
            .eq('is_active', true)
            .gte('application_deadline', new Date().toISOString()); // Only valid deadlines

        if (grantsError) throw grantsError;

        // 3. Fetch All Companies
        // In a real scenario, we might want to paginate this or filter by "recently updated"
        const { data: companies, error: companiesError } = await supabaseAdmin
            .from('companies')
            .select('*');

        if (companiesError) throw companiesError;

        if (!rules || !grants || !companies) {
            return NextResponse.json({ message: 'No data found' }, { status: 404 });
        }

        // 4. Instantiate Engine
        const engine = new MatchingEngine(rules as ScoringRule[]);
        let matchCount = 0;
        const upserts = [];

        // 5. Run Matching
        for (const company of (companies as Company[])) {
            for (const grant of (grants as Grant[])) {
                const result = engine.evaluate(company, grant);

                // Threshold: Only save if score > 30 (to avoid noise)
                if (result.total_score > 30) {
                    matchCount++;
                    upserts.push({
                        company_id: company.id,
                        grant_id: grant.id,
                        match_score: result.total_score,
                        match_data: result.match_details,
                        status: 'opportunity', // Reset status or keep existing? 
                        // Ideally we should check if it exists to preserve status, but for this MVP let's do upsert.
                        // "ON CONFLICT (company_id, grant_id) DO UPDATE SET match_score = EXCLUDED.match_score, match_data = EXCLUDED.match_data"
                        updated_at: new Date().toISOString() // Assuming there is an updated_at column or trigger handles it
                    });
                }
            }
        }

        // 6. Bulk Upsert (Batching recommended for large datasets, but fine for now)
        if (upserts.length > 0) {
            const { error: upsertError } = await supabaseAdmin
                .from('company_grants')
                .upsert(upserts, {
                    onConflict: 'company_id,grant_id',
                    ignoreDuplicates: false
                });

            if (upsertError) throw upsertError;
        }

        return NextResponse.json({
            success: true,
            processed: {
                companies: companies.length,
                grants: grants.length,
                total_combinations: companies.length * grants.length
            },
            matches_found: matchCount
        });

    } catch (error: any) {
        console.error('Matching Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
