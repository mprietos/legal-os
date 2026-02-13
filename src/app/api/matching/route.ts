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

    // Ejecutar motor de matching
    const results = await MatchingEngine.evaluateCompany(companyId);

    // Guardar resultados
    await MatchingEngine.saveMatchingResults(companyId, results);

    return NextResponse.json({
      success: true,
      complianceScore: results.complianceScore,
      totalRequirements: results.complianceMatches.length,
      totalGrants: results.grantMatches.length,
    });
  } catch (error: any) {
    console.error('Error en matching API:', error);
    return NextResponse.json(
      { error: error.message || 'Error en el matching' },
      { status: 500 }
    );
  }
}
