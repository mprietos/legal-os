import { NextRequest, NextResponse } from 'next/server';
import { MatchingEngine } from '@/lib/matching-engine';

export async function POST(request: NextRequest) {
    try {
        const { companyId } = await request.json();

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID requerido' },
                { status: 400 }
            );
        }

        const newScore = await MatchingEngine.recalculateCompanyScore(companyId);

        return NextResponse.json({
            success: true,
            complianceScore: newScore,
        });
    } catch (error: any) {
        console.error('Error recalculando score:', error);
        return NextResponse.json(
            { error: error.message || 'Error al recalcular score' },
            { status: 500 }
        );
    }
}
