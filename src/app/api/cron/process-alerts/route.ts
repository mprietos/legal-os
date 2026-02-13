import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AlertsEngine } from '@/lib/alerts/engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('Starting Alerts Processing...');

        // 1. Fetch all companies (In prod, paginate this)
        const { data: companies, error } = await supabaseAdmin
            .from('companies')
            .select('id');

        if (error) throw error;
        if (!companies) return NextResponse.json({ message: 'No companies found' });

        let totalAlerts = 0;

        // 2. Process each company
        for (const company of companies) {
            const count = await AlertsEngine.generateAlertsForCompany(company.id);
            totalAlerts += count;
        }

        return NextResponse.json({
            success: true,
            companies_processed: companies.length,
            alerts_generated_or_updated: totalAlerts
        });

    } catch (error: any) {
        console.error('Alerts Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
