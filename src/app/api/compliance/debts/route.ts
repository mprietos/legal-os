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
        // In a real scenario, this would use a search API or a specialized service.
        // For this demonstration, we ask Gemini to analyze public record patterns or 
        // provide instructions on where to check based on the company profile.
        const prompt = `
      Actúa como un consultor legal y experto en cumplimiento tributario en España.
      La empresa con CIF/NIF ${company.cif_nif} (${company.name}) solicita una verificación de posibles deudas o multas pendientes en registros públicos.
      
      Basándote en tu conocimiento actualizado hasta ahora, indica si existen registros públicos (BOE, tablones de edictos, deudas con la Seguridad Social o Hacienda) que esta empresa deba revisar. 
      Específicamente, busca patrones de notificaciones para este CIF/NIF o sector (${company.sector}) en la región de ${company.region || 'España'}.
      
      Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
      {
        "status": "clean" | "warning" | "alerts_found",
        "summary": "Resumen general de la situación (1 frase)",
        "findings": [
          {
            "source": "Nombre del organismo/registro (ej: Seguridad Social, AEAT, BOE)",
            "type": "Tipo de incidencia (ej: Notificación por comparecencia, Deuda pendiente)",
            "description": "Breve descripción de lo que se ha encontrado o lo que se debe revisar",
            "urgency": "high" | "medium" | "low"
          }
        ],
        "recommendations": ["Recomendación 1", "Recomendación 2"]
      }
      
      Si no encuentras nada específico, proporciona una respuesta de 'status: clean' pero incluye qué registros has consultado virtualmente.
    `;

        // 3. Generate analysis with Gemini
        const responseText = await AIService.generateText(prompt, { provider: 'gemini' });

        // Clean potential markdown from JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;

        const results = JSON.parse(cleanJson);

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error in debt search:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
