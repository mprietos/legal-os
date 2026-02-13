import { AIService, type AIProvider } from './providers';

interface CompanyContext {
  name: string;
  cif_nif: string;
  sector: string;
  company_size: string;
  employee_count?: number;
  annual_revenue?: number;
  country: string;
  region?: string;
}

interface GrantContext {
  title: string;
  description: string;
  issuer: string;
  requirements?: any;
  max_amount?: number;
}

export class DocumentGenerator {
  /**
   * Genera una solicitud de subvención personalizada
   */
  static async generateGrantApplication(
    company: CompanyContext,
    grant: GrantContext,
    provider?: AIProvider
  ): Promise<string> {
    const prompt = `Eres un experto en redacción de solicitudes de subvenciones para PYMEs.

Genera una solicitud profesional y persuasiva para la siguiente subvención:

SUBVENCIÓN:
- Título: ${grant.title}
- Descripción: ${grant.description}
- Organismo: ${grant.issuer}
${grant.max_amount ? `- Importe máximo: ${grant.max_amount}€` : ''}

DATOS DE LA EMPRESA:
- Nombre: ${company.name}
- CIF: ${company.cif_nif}
- Sector: ${company.sector}
- Tamaño: ${company.company_size}
${company.employee_count ? `- Empleados: ${company.employee_count}` : ''}
${company.annual_revenue ? `- Facturación anual: ${company.annual_revenue}€` : ''}
- País: ${company.country}
${company.region ? `- Región: ${company.region}` : ''}

INSTRUCCIONES:
1. Redacta una solicitud formal y profesional
2. Destaca por qué la empresa es un candidato ideal
3. Alinea las características de la empresa con los objetivos de la subvención
4. Incluye secciones: Presentación, Justificación, Plan de uso de fondos, Resultados esperados
5. Usa un tono profesional pero cercano
6. Longitud: 800-1200 palabras
7. Formato markdown con secciones claras

Genera SOLO el documento, sin preámbulos ni explicaciones adicionales.`;

    return await AIService.generateText(prompt, { provider, maxTokens: 4000 });
  }

  /**
   * Genera un documento de política de compliance
   */
  static async generateCompliancePolicy(
    company: CompanyContext,
    policyType: string,
    requirements?: string[],
    provider?: AIProvider
  ): Promise<string> {
    const prompt = `Eres un experto en compliance legal para PYMEs.

Genera un documento de política de ${policyType} para la siguiente empresa:

DATOS DE LA EMPRESA:
- Nombre: ${company.name}
- CIF: ${company.cif_nif}
- Sector: ${company.sector}
- Tamaño: ${company.company_size}
${company.employee_count ? `- Empleados: ${company.employee_count}` : ''}

${requirements ? `REQUISITOS A CUBRIR:\n${requirements.map(r => `- ${r}`).join('\n')}` : ''}

INSTRUCCIONES:
1. Crea un documento profesional y aplicable
2. Usa lenguaje claro y no excesivamente legal
3. Incluye secciones: Objetivo, Ámbito de aplicación, Responsabilidades, Procedimientos
4. Adapta el contenido al tamaño y sector de la empresa
5. Incluye ejemplos prácticos cuando sea relevante
6. Formato markdown con estructura clara
7. Longitud: 600-1000 palabras

Genera SOLO el documento, sin preámbulos ni explicaciones adicionales.`;

    return await AIService.generateText(prompt, { provider, maxTokens: 3000 });
  }

  /**
   * Genera un reporte de compliance
   */
  static async generateComplianceReport(
    company: CompanyContext,
    complianceScore: number,
    completedItems: number,
    pendingItems: number,
    criticalItems: string[],
    provider?: AIProvider
  ): Promise<string> {
    const prompt = `Eres un experto en compliance que genera reportes ejecutivos para PYMEs.

Genera un reporte de estado de compliance para:

EMPRESA:
- Nombre: ${company.name}
- Sector: ${company.sector}
- Tamaño: ${company.company_size}

ESTADO ACTUAL:
- Compliance Score: ${complianceScore}/100
- Items completados: ${completedItems}
- Items pendientes: ${pendingItems}
${criticalItems.length > 0 ? `- Items críticos pendientes:\n${criticalItems.map(i => `  * ${i}`).join('\n')}` : ''}

INSTRUCCIONES:
1. Genera un reporte ejecutivo profesional
2. Incluye: Resumen ejecutivo, Estado actual, Áreas de mejora, Recomendaciones prioritarias, Próximos pasos
3. Usa un tono profesional pero accesible
4. Destaca tanto logros como áreas de mejora
5. Proporciona recomendaciones accionables
6. Formato markdown
7. Longitud: 500-800 palabras

Genera SOLO el documento, sin preámbulos.`;

    return await AIService.generateText(prompt, { provider, maxTokens: 2500 });
  }

  /**
   * Genera una guía de acción para un requisito específico
   */
  static async generateActionGuide(
    company: CompanyContext,
    requirementTitle: string,
    requirementDescription: string,
    actionSteps?: any,
    provider?: AIProvider
  ): Promise<string> {
    const prompt = `Eres un consultor de compliance que ayuda a PYMEs a cumplir con requisitos legales.

Genera una guía de acción práctica para:

REQUISITO: ${requirementTitle}
DESCRIPCIÓN: ${requirementDescription}

EMPRESA:
- Nombre: ${company.name}
- Sector: ${company.sector}
- Tamaño: ${company.company_size}
${company.employee_count ? `- Empleados: ${company.employee_count}` : ''}

${actionSteps ? `PASOS SUGERIDOS:\n${JSON.stringify(actionSteps, null, 2)}` : ''}

INSTRUCCIONES:
1. Crea una guía paso a paso muy práctica y accionable
2. Usa lenguaje simple y claro, evita jerga legal
3. Incluye: ¿Qué es?, ¿Por qué es importante?, Pasos específicos, Documentación necesaria, Plazos, Consejos prácticos
4. Adapta las instrucciones al contexto específico de la empresa
5. Incluye advertencias sobre errores comunes
6. Formato markdown con listas y checkboxes
7. Longitud: 400-700 palabras

Genera SOLO el documento, sin preámbulos.`;

    return await AIService.generateText(prompt, { provider, maxTokens: 2000 });
  }
  /**
   * Obtiene el modelo activo actual
   */
  static getActiveModelInfo() {
    return AIService.getActiveProvider();
  }
}
