import { NextRequest, NextResponse } from 'next/server';
import { DocumentGenerator } from '@/lib/ai/document-generator';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, documentType, grantId, requirementId } = body;

    // Obtener datos de la empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // --- CREDIT SYSTEM LOGIC ---
    const isFreePlan = company.plan === 'free';
    const credits = company.credits ?? 0;

    if (isFreePlan && credits <= 0) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          message: 'Has agotado tus 3 créditos gratuitos. Pásate a PRO para generación ilimitada.',
          code: 'INSUFFICIENT_CREDITS'
        },
        { status: 402 } // Payment Required
      );
    }
    // ---------------------------

    let documentContent = '';
    let documentTitle = '';
    let relatedGrantId = null;
    let relatedRequirementId = null;

    // Generar documento según el tipo
    if (documentType === 'grant_application' && grantId) {
      const { data: grant } = await supabaseAdmin
        .from('grants')
        .select('*')
        .eq('id', grantId)
        .single();

      if (!grant) {
        return NextResponse.json(
          { error: 'Subvención no encontrada' },
          { status: 404 }
        );
      }

      documentContent = await DocumentGenerator.generateGrantApplication(company, grant);
      documentTitle = `Solicitud - ${grant.title}`;
      relatedGrantId = grantId;
    } else if (documentType === 'action_guide' && requirementId) {
      const { data: requirement } = await supabaseAdmin
        .from('compliance_requirements')
        .select('*')
        .eq('id', requirementId)
        .single();

      if (!requirement) {
        return NextResponse.json(
          { error: 'Requisito no encontrado' },
          { status: 404 }
        );
      }

      documentContent = await DocumentGenerator.generateActionGuide(
        company,
        requirement.title,
        requirement.description,
        requirement.action_steps
      );
      documentTitle = `Guía - ${requirement.title}`;
      relatedRequirementId = requirementId;
    } else if (documentType === 'compliance_report') {
      // Obtener datos de compliance
      const { data: complianceItems } = await supabaseAdmin
        .from('company_compliance')
        .select('*, requirement:compliance_requirements(*)')
        .eq('company_id', companyId);

      const completed = complianceItems?.filter((i: any) => i.status === 'completed').length || 0;
      const pending = complianceItems?.filter((i: any) => i.status === 'pending').length || 0;
      const critical = complianceItems
        ?.filter((i: any) => i.status === 'pending' && (i.requirement as any)?.severity === 'critical')
        .map((i: any) => (i.requirement as any)?.title) || [];

      documentContent = await DocumentGenerator.generateComplianceReport(
        company,
        company.compliance_score,
        completed,
        pending,
        critical
      );
      documentTitle = 'Reporte de Compliance';
    } else {
      return NextResponse.json(
        { error: 'Tipo de documento no válido' },
        { status: 400 }
      );
    }

    // Obtener el modelo activo para guardarlo
    const { model: activeModel } = DocumentGenerator.getActiveModelInfo();

    // Guardar documento generado
    const { data: savedDocument, error: saveError } = await supabaseAdmin
      .from('generated_documents')
      .insert({
        company_id: companyId,
        document_type: documentType,
        title: documentTitle,
        content: documentContent,
        related_grant_id: relatedGrantId,
        related_requirement_id: relatedRequirementId,
        ai_model: activeModel,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving document:', saveError);
      return NextResponse.json(
        { error: 'Error al guardar el documento' },
        { status: 500 }
      );
    }

    // --- UPDATE CREDITS IF FREE PLAN ---
    if (isFreePlan) {
      await supabaseAdmin
        .from('companies')
        .update({ credits: credits - 1 })
        .eq('id', companyId);
    }
    // ------------------------------------

    return NextResponse.json({
      success: true,
      document: savedDocument,
      remainingCredits: isFreePlan ? credits - 1 : null
    });
  } catch (error: any) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar documento' },
      { status: 500 }
    );
  }
}
