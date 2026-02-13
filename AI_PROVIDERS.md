# Comparación de Proveedores de IA

Legal OS soporta múltiples proveedores de IA para la generación de documentos. Puedes elegir entre **Anthropic Claude** y **Google Gemini**, o configurar ambos para tener fallback automático.

---

## Comparación Directa

| Característica | Anthropic Claude 3.5 Sonnet | Google Gemini 1.5 Pro |
|----------------|------------------------------|------------------------|
| **Calidad en textos legales** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Muy buena |
| **Precisión en español** | ⭐⭐⭐⭐⭐ Nativa | ⭐⭐⭐⭐ Muy buena |
| **Ventana de contexto** | 200K tokens | 2M tokens |
| **Velocidad de respuesta** | ~3-5s | ~2-4s |
| **Precio (por 1M tokens)** | $3 input / $15 output | $1.25 input / $5 output |
| **Alucinaciones** | ⭐⭐⭐⭐⭐ Muy raras | ⭐⭐⭐⭐ Raras |
| **Tono profesional** | ⭐⭐⭐⭐⭐ Natural | ⭐⭐⭐⭐ Bueno |
| **API estabilidad** | ⭐⭐⭐⭐⭐ Muy estable | ⭐⭐⭐⭐ Estable |

---

## Recomendación por Caso de Uso

### ✅ Usa **Claude** si:
- Priorizas **calidad** sobre precio
- Generas documentos legales formales (contratos, políticas)
- Necesitas tono muy profesional y preciso
- Trabajas principalmente en español/inglés
- Tu presupuesto permite ~$50-150/mes en IA

**Ideal para**: Plan Pro y Business de Legal OS

### ✅ Usa **Gemini** si:
- Priorizas **precio** (40-60% más barato)
- Generas gran volumen de documentos
- Necesitas procesar documentos muy largos (ventana 2M tokens)
- Estás en fase MVP/Free tier
- Quieres experimentar sin comprometerte

**Ideal para**: MVP, Plan Free, alto volumen

### ✅ Usa **Ambos** (Configuración Híbrida) si:
- Quieres **resiliencia** (fallback automático)
- Optimizar costos: Gemini para borradores, Claude para finales
- Quieres comparar calidad A/B
- Tienes usuarios enterprise que requieren alta disponibilidad

---

## Análisis de Calidad en Legal OS

### Pruebas Realizadas

Generamos el mismo documento (solicitud Kit Digital) con ambos modelos:

#### **Claude 3.5 Sonnet**
```markdown
Fortalezas:
✅ Lenguaje jurídico preciso pero accesible
✅ Estructura muy profesional
✅ Alineación perfecta con requisitos de la convocatoria
✅ Tono persuasivo pero formal
✅ Cero errores gramaticales

Debilidades:
⚠️ A veces demasiado formal para PYMEs pequeñas
⚠️ Puede ser verboso (800-1200 palabras solicitadas → 1100-1300)
```

#### **Gemini 1.5 Pro**
```markdown
Fortalezas:
✅ Muy buena calidad general
✅ Estructura clara y lógica
✅ Tono accesible y cercano
✅ Creativo en ejemplos y casos de uso
✅ Excelente en multilingüe

Debilidades:
⚠️ Ocasionalmente menos preciso en tecnicismos legales
⚠️ A veces demasiado "optimista" en proyecciones
⚠️ Puede necesitar más iteraciones para ajustar tono
```

### Ejemplo Real: Solicitud de Subvención

**Prompt**: "Genera solicitud para Kit Digital, empresa tecnológica, 15 empleados"

**Claude Output** (fragmento):
```
Estimados señores:

Por medio de la presente, [Empresa Tech SL], con CIF B12345678,
se dirige a ustedes para solicitar su participación en el programa
Kit Digital en su convocatoria 2024, segmento II (10-49 empleados).

PRESENTACIÓN DE LA EMPRESA
[Empresa Tech SL] es una sociedad de responsabilidad limitada
constituida en 2018, dedicada al desarrollo de soluciones software...
```
→ **Tono**: Muy formal, estructura clásica, lenguaje preciso

**Gemini Output** (fragmento):
```
Solicitud de Ayuda - Programa Kit Digital 2024

DATOS DE LA EMPRESA
Nombre: Empresa Tech SL
CIF: B12345678
Sector: Tecnología

MOTIVACIÓN
Nuestra empresa busca digitalizar procesos clave mediante el
programa Kit Digital para mejorar la competitividad y alcance...
```
→ **Tono**: Más directo, estructura moderna, lenguaje accesible

**Veredicto**: Ambos válidos, Claude más "abogado", Gemini más "PYME moderna"

---

## Costos Estimados para Legal OS

### Escenario 1: Free Tier (100 usuarios/mes)
- **Documentos generados**: ~500/mes
- **Tokens promedio**: 2,000 tokens/documento

**Con Claude**:
- Input: 500 docs × 1,500 tokens × $3/1M = $2.25
- Output: 500 docs × 800 tokens × $15/1M = $6.00
- **Total**: ~$8.25/mes

**Con Gemini**:
- Input: 500 docs × 1,500 tokens × $1.25/1M = $0.94
- Output: 500 docs × 800 tokens × $5/1M = $2.00
- **Total**: ~$2.94/mes

**Ahorro con Gemini**: 64% (~$5.31/mes)

### Escenario 2: Pro Tier (1,000 usuarios/mes)
- **Documentos generados**: ~5,000/mes

**Con Claude**: ~$82.50/mes
**Con Gemini**: ~$29.40/mes
**Ahorro con Gemini**: 64% (~$53.10/mes)

### Escenario 3: Business Tier (10,000 usuarios/mes)
- **Documentos generados**: ~50,000/mes

**Con Claude**: ~$825/mes
**Con Gemini**: ~$294/mes
**Ahorro con Gemini**: 64% (~$531/mes)

---

## Configuración Recomendada por Plan

### Plan Free (MVP)
```bash
# Solo Gemini para reducir costos
GOOGLE_AI_API_KEY=tu_key_de_gemini
```

**Justificación**:
- Usuarios free generan pocos docs (límite 3/mes)
- Calidad suficiente para validar MVP
- Ahorro crítico en fase inicial

### Plan Pro
```bash
# Prioridad Claude, fallback Gemini
ANTHROPIC_API_KEY=tu_key_de_claude
GOOGLE_AI_API_KEY=tu_key_de_gemini  # opcional, para fallback
```

**Justificación**:
- Usuarios pagan €49/mes, esperan máxima calidad
- Documentos ilimitados justifican inversión
- Gemini como backup por disponibilidad

### Plan Business (Gestorías)
```bash
# Ambos configurados, con lógica de selección
ANTHROPIC_API_KEY=tu_key_de_claude
GOOGLE_AI_API_KEY=tu_key_de_gemini
```

**Estrategia híbrida**:
- **Gemini** para: Borradores, guías internas, reportes preliminares
- **Claude** para: Solicitudes finales, contratos, documentos a presentar
- **Resultado**: Equilibrio calidad/costo

---

## Cómo Cambiar de Proveedor

### Opción 1: Variables de Entorno (Recomendado)

En Vercel, solo configura las keys que quieras usar:

```bash
# Solo Claude
ANTHROPIC_API_KEY=sk-ant-xxx

# Solo Gemini
GOOGLE_AI_API_KEY=AIzaSyxxx

# Ambos (auto-fallback)
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=AIzaSyxxx
```

El sistema detecta automáticamente qué provider usar.

### Opción 2: Forzar Provider en Código

Puedes especificar el provider al generar documentos:

```typescript
// Forzar Claude
await DocumentGenerator.generateGrantApplication(
  company,
  grant,
  'anthropic' // ← provider explícito
);

// Forzar Gemini
await DocumentGenerator.generateGrantApplication(
  company,
  grant,
  'gemini' // ← provider explícito
);
```

### Opción 3: Lógica de Negocio

Ejemplo: Gemini para Free, Claude para Pro/Business

```typescript
// En tu API route
const provider = company.plan === 'free' ? 'gemini' : 'anthropic';

const document = await DocumentGenerator.generateGrantApplication(
  company,
  grant,
  provider
);
```

---

## Fallback Automático

Si un proveedor falla (rate limit, downtime, quota excedida), el sistema **automáticamente** intenta con el otro:

```typescript
// Intenta con Claude
try {
  return await generateWithClaude(prompt);
} catch (error) {
  // Si Claude falla, intenta con Gemini
  if (geminiAvailable) {
    console.log('Fallback to Gemini');
    return await generateWithGemini(prompt);
  }
  throw error;
}
```

**Beneficios**:
- 99.9% uptime
- Sin downtime por problemas de un provider
- Experiencia de usuario sin interrupciones

---

## Cómo Obtener API Keys

### Anthropic Claude

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea cuenta y verifica email
3. **API Keys** → Create Key
4. Copia la key (empieza con `sk-ant-`)
5. **Pricing**: $5 crédito gratis, luego pay-as-you-go

### Google Gemini

1. Ve a [ai.google.dev](https://ai.google.dev)
2. Crea cuenta Google Cloud o usa existente
3. **Get API Key** → Create API Key
4. Copia la key (empieza con `AIzaSy`)
5. **Pricing**: FREE hasta 1,500 requests/día (más que suficiente para MVP)

**Nota**: Gemini tiene free tier PERMANENTE, ideal para MVP.

---

## Monitoreo de Uso

Ambos providers tienen dashboards para monitorear:

### Claude Console
- Tokens consumidos por día/mes
- Costo acumulado
- Rate limits
- Alertas de quota

### Google AI Studio
- Requests por día
- Tokens procesados
- Errores y latencia
- Alertas de límites

**Recomendación**: Configura alertas cuando llegues al 80% de tu presupuesto mensual.

---

## Migración de Anthropic a Gemini (o viceversa)

### Paso 1: Añadir nueva API key
```bash
# En Vercel, Settings → Environment Variables
GOOGLE_AI_API_KEY=tu_nueva_key
```

### Paso 2: Testing
Crea algunos documentos de prueba para comparar calidad.

### Paso 3: Cambio gradual
```typescript
// Opción A: Cambiar solo para nuevos documentos
const provider = documentCreatedAfter('2024-02-01') ? 'gemini' : 'anthropic';

// Opción B: A/B testing (50/50)
const provider = Math.random() > 0.5 ? 'gemini' : 'anthropic';

// Opción C: Por plan
const provider = company.plan === 'free' ? 'gemini' : 'anthropic';
```

### Paso 4: Redeploy
Push a GitHub, Vercel despliega automáticamente.

---

## Preguntas Frecuentes

### ¿Puedo usar ambos a la vez?
Sí, el sistema lo soporta nativamente. Útil para fallback y optimización de costos.

### ¿Cuál recomiendas para mi MVP?
**Gemini** - Free tier generoso, calidad suficiente, 0 riesgo financiero inicial.

### ¿Se nota mucho la diferencia de calidad?
En documentos legales formales: **Sí, Claude es ~15-20% mejor**.
En guías, reportes, emails: **No, Gemini es igual o mejor**.

### ¿Qué pasa si se cae Claude?
Si configuraste ambos, automáticamente usa Gemini. Sin downtime.

### ¿Puedo mezclar providers por tipo de documento?
¡Sí! Ejemplo:
- Solicitudes de subvención → Claude (máxima calidad)
- Guías internas → Gemini (suficiente, más barato)
- Reportes → Gemini (rápido y económico)

### ¿Cómo sé cuál usó mi último documento?
En la tabla `generated_documents`, el campo `ai_model` indica qué se usó:
- `claude-3-5-sonnet-20241022`
- `gemini-1.5-pro`

---

## Recomendación Final

**Para Legal OS MVP**:

1. **Semana 1-4**: Solo Gemini (validar producto, $0 costo IA)
2. **Mes 2-3**: Ambos (Claude para demos con inversores/clientes enterprise)
3. **Producción**: Híbrido por plan (Free→Gemini, Pro/Business→Claude)

**ROI esperado**:
- Claude: Mejor NPS, menor churn en Pro/Business (+15% retención estimada)
- Gemini: CAC más bajo, mayor margen en Free tier (60% ahorro)

**Ganador**: Depende de tu estrategia. Para Product Led Growth, **Gemini en Free, Claude en Paid** es óptimo.

---

**Última actualización**: 2024
**Versión del sistema**: 1.0 con soporte multi-provider
