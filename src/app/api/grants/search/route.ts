import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
    try {
        const { companyId } = await req.json();

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // 1. Get company details
        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        if (companyError || !company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // 2. Prepare prompt for Gemini
        const prompt = `
      Actúa como un experto en subvenciones y ayudas públicas en España. 
      Basándote en el perfil de esta empresa, busca y sugiere 5 ayudas o subvenciones (locales, autonómicas, nacionales o europeas) que sean altamente relevantes y que podrían no estar en una base de datos estándar.
      
      Perfil de la empresa:
      - Nombre: ${company.name}
      - Sector: ${company.sector}
      - CNAE: ${company.cnae_code} (${company.cnae_description || 'No especificado'})
      - Tamaño: ${company.company_size}
      - Empleados: ${company.employee_count || 'No especificado'}
      - Facturación: ${company.annual_revenue || 'No especificado'} €
      - Región: ${company.region || 'Toda España'}
      
      Por cada ayuda, proporciona:
      1. Título de la ayuda
      2. Organismo emisor
      3. Breve descripción (2 frases)
      4. Importe máximo estimado
      5. Por qué encaja con esta empresa (explicación breve)
      
      Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
      {
        "suggestions": [
          {
            "title": "string",
            "issuer": "string",
            "description": "string",
            "estimated_amount": "string",
            "match_reason": "string"
          }
        ]
      }
    `;

        // 3. Generate suggestions with Gemini
        const responseText = await AIService.generateText(prompt, { provider: 'gemini' });

        // Clean potential markdown from JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;

        const results = JSON.parse(cleanJson);

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error in grant search:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
