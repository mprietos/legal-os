import { NextResponse } from 'next/server';
import { AlertsEngine } from '@/lib/alerts/engine';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { companyId } = await request.json();

        if (!companyId) {
            return NextResponse.json({ success: false, error: 'Missing companyId' }, { status: 400 });
        }

        const count = await AlertsEngine.generateAlertsForCompany(companyId);

        return NextResponse.json({
            success: true,
            alerts_active: count
        });

    } catch (error: any) {
        console.error('Alerts Refresh Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
