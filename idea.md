¡Excelente elección! La #5 (SaaS de Inteligencia Regulatoria y Ayudas) es la más sólida para un MVP porque el "inventario" es puramente información (BOEs, leyes, convocatorias). No dependes de hardware ni de logística física, solo de la capacidad de procesamiento de Claude.

Para que este proyecto sea un éxito con Claude Code, vamos a llamarlo provisionalmente: ReguMind AI.

Aquí tienes el kit de inicio para que abras una nueva conversación en Gemini (o uses esta misma) y luego pases a la acción con Claude Code.

1. Definición del Producto (Para tu Pitch)
Concepto: Un "Escudo Legal y Radar de Ingresos" para PYMES.

Problema: Las PYMES operan "a ciegas", perdiendo ayudas por desconocimiento y pagando multas por cambios legales que no vieron venir.

Solución: Un agente que perfila la empresa y cruza sus datos con boletines oficiales diariamente para ofrecer alertas accionables.

2. Roadmap del MVP (Qué construir primero)
No intentes leer todos los países. Empieza por uno (ej. España o un estado de EE.UU.) y un sector (ej. Hostelería o Tech).

Onboarding: Formulario simple de perfil de empresa (Sector, CIF, empleados, facturación).

Engine: Un script que procese un JSON/Feed de noticias legales.

Matching: Lógica de Claude para decidir si una ley "X" aplica a la empresa "Y".

Action: Botón de "Generar borrador de cumplimiento" o "Descargar guía de solicitud".

3. Prompt Maestro para empezar en Gemini
Copia y pega este prompt en una nueva conversación para que Gemini te de las instrucciones exactas de arquitectura antes de ir a Claude Code:

Actúa como mi CTO y Socio Fundador. Vamos a construir "ReguMind AI", un SaaS B2B de inteligencia regulatoria y subvenciones.

Necesito que diseñes la arquitectura para un MVP que haré con Claude Code:

Stack: Next.js 15, Tailwind CSS, Supabase para DB y Auth, y Claude API para el análisis.

Esquema de DB: Necesito las tablas para Empresas, Normativas, y Matches (donde se une la empresa con la ley/ayuda).

Lógica de Agente: Explícame cómo estructurar el prompt que enviaré a la API de Claude para que analice un texto legal y extraiga: a) Resumen simple, b) Fecha límite, c) Acciones requeridas, d) Nivel de urgencia.

Estrategia de Negocio: Define cómo conseguir los primeros 10 clientes (Beta testers) atacando a gestorías o asociaciones profesionales.

Dame también el primer prompt técnico para Claude Code que cree la estructura de carpetas y el Dashboard principal.

4. Estrategia de Negocio (Tracción y Clientes)
Para que esto tenga cara de negocio ante un inversor:

Beta Testers: Busca 5 gestorías pequeñas. Ofréceles la herramienta gratis para sus clientes a cambio de feedback. Las gestorías son el canal de distribución perfecto; si les ahorras trabajo a ellos, te traen a cientos de PYMES.

Growth Hack: Crea una "Landing Page" de imán de leads que diga: "¿Qué ayudas puede pedir tu empresa este mes? Pon tu CIF y descúbrelo". Usa Claude para analizar los datos públicos del CIF y dar un informe rápido. Eso genera confianza instantánea.

¿Qué quieres que hagamos ahora?
¿Te ayudo a refinar el esquema de la base de datos para que Claude Code no cometa errores al crearla?

¿Quieres que redactemos el guion de venta para esas 5 primeras gestorías?

¿O pasamos directamente a los comandos de terminal para empezar a crear el código?

¡Este proyecto tiene un potencial increíble para 2026!