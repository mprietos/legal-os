# Arquitectura del Sistema - Legal OS

## Visión General

Legal OS es un SaaS B2B orientado a Product Led Growth, diseñado para escalar con arquitectura modular y serverless.

## Principios de Diseño

### 1. Simplicidad
- Arquitectura serverless con Next.js y Vercel
- Sin microservicios innecesarios
- Base de datos única (Supabase PostgreSQL)

### 2. Modularidad
- Separación clara entre capas
- Componentes reutilizables
- Lógica de negocio centralizada en `lib/`

### 3. Escalabilidad
- Serverless functions (auto-scaling)
- Caching estratégico
- Row Level Security para multi-tenancy

### 4. Product Led Growth
- Onboarding < 60 segundos
- Valor inmediato (compliance score)
- Upgrade path claro (free → pro → business)

## Stack Técnico Detallado

### Frontend
```
Next.js 14 (App Router)
├── React 18 (Server + Client Components)
├── TypeScript (type safety)
├── Tailwind CSS (utility-first styling)
└── Lucide React (iconos)
```

**Decisiones:**
- **App Router** sobre Pages Router: Mejor performance, React Server Components
- **TypeScript**: Reducción de bugs, mejor DX
- **Tailwind**: Velocidad de desarrollo, consistencia

### Backend
```
Next.js API Routes
├── Route Handlers (app/api/)
├── Server Actions (futuro)
└── Middleware (auth, routing)
```

**Decisiones:**
- **Serverless functions**: Auto-scaling, pay-per-use
- **Mismo repo frontend/backend**: Simplicidad, shared types

### Base de Datos
```
Supabase (PostgreSQL)
├── Auth (gestión de usuarios)
├── Database (PostgreSQL 15)
├── Row Level Security (multi-tenancy)
└── Realtime (futuro)
```

**Decisiones:**
- **Supabase** sobre otras opciones:
  - Auth integrado
  - RLS nativo
  - API auto-generada
  - Hosting incluido
  - Free tier generoso

### IA
```
Anthropic Claude
├── Claude 3.5 Sonnet (generación de documentos)
└── Streaming (futuro)
```

**Decisiones:**
- **Claude** sobre GPT:
  - Mejor en tareas largas (documentos legales)
  - Ventana de contexto grande (200K tokens)
  - Menos alucinaciones en contextos formales

## Flujos de Datos

### 1. Onboarding Flow
```
Usuario ingresa CIF
    ↓
[Validator] Valida formato CIF/NIF
    ↓
[Infer] Infiere tipo de entidad
    ↓
[DB] Crea company + user_profile
    ↓
[Matching Engine] Evalúa compliance y grants
    ↓
[DB] Guarda resultados (company_compliance, company_grants)
    ↓
[Update] Actualiza compliance_score
    ↓
Redirect a Dashboard
```

### 2. Matching Engine Flow
```
evaluateCompany(companyId)
    ↓
[DB] Fetch company data
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
matchCompliance   matchGrants
│                 │
[Filter] por      [Filter] por
país/sector       país/sector/tamaño
│                 │
[Prioritize]      [Score] 0-100
│                 │
└─────────────────┴─────────────────┘
    ↓
calculateComplianceScore()
    ↓
saveMatchingResults()
    ↓
Return results
```

### 3. Document Generation Flow
```
Request (POST /api/generate-document)
    ↓
[Auth] Verificar usuario
    ↓
[DB] Fetch company + context (grant/requirement)
    ↓
[AI] Llamada a Claude con prompt específico
    ↓
[Stream] Respuesta del modelo (futuro)
    ↓
[DB] Guardar en generated_documents
    ↓
[Response] Return document
```

## Modelo de Datos

### Entidades Core

#### Companies (Multi-tenant base)
```typescript
companies {
  id: UUID (PK)
  cif_nif: VARCHAR (UNIQUE)
  name: VARCHAR

  // Segmentación
  country: VARCHAR(2)
  sector: VARCHAR
  company_size: ENUM

  // Scoring
  compliance_score: INT (0-100)

  // Multi-tenancy
  owner_id: UUID → auth.users
  managed_by: UUID → auth.users (para gestorías)

  // Subscription
  plan: ENUM (free, pro, business)
}
```

#### Compliance Requirements (Catálogo maestro)
```typescript
compliance_requirements {
  id: UUID (PK)
  title: VARCHAR
  description: TEXT
  category: VARCHAR
  severity: ENUM

  // Aplicabilidad
  countries: VARCHAR[] (array de códigos ISO)
  sectors: VARCHAR[]
  company_sizes: VARCHAR[]

  // Temporalidad
  is_recurring: BOOLEAN
  frequency: VARCHAR (monthly, quarterly, annual)

  // Guía
  action_steps: JSONB
  estimated_time: INT (minutos)
}
```

#### Company Compliance (Estado por empresa)
```typescript
company_compliance {
  id: UUID (PK)
  company_id: UUID → companies
  requirement_id: UUID → compliance_requirements

  status: ENUM (pending, in_progress, completed, not_applicable)
  priority: INT (1-5)
  due_date: DATE

  UNIQUE(company_id, requirement_id)
}
```

### Row Level Security (RLS)

```sql
-- Solo ver/editar empresas propias o gestionadas
CREATE POLICY "users_own_companies" ON companies
  FOR SELECT USING (
    auth.uid() = owner_id OR
    auth.uid() = managed_by
  );

-- Compliance items solo de empresas accesibles
CREATE POLICY "users_company_compliance" ON company_compliance
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies
      WHERE owner_id = auth.uid() OR managed_by = auth.uid()
    )
  );
```

## Algoritmos Clave

### Compliance Score Calculation
```typescript
// Base: 30 puntos por onboarding completo
// Penalización: -5 puntos por cada requisito pendiente
// Mínimo: 0, Máximo: 100

baseScore = 30
penalty = min(pendingRequirements * 5, 70)
complianceScore = max(baseScore - penalty, 0)
```

### Grant Match Score
```typescript
score = 0

// País (obligatorio)
if (!grant.countries.includes(company.country)) return 0
score += 30

// Sector
if (grant.sectors.includes('todos') || grant.sectors.includes(company.sector))
  score += 30
else return 0

// Tamaño
if (grant.company_sizes.includes(company.company_size))
  score += 25
else return 0

// Empleados (si aplica)
if (within range) score += 15

// Plazo
if (deadline > now) score += 10

return min(score, 100)
```

## Estrategia de Caching

### Client-side
- SWR/React Query para datos de dashboard
- Stale-while-revalidate pattern
- Cache de 5 minutos para compliance items

### Server-side
- Next.js Static Generation para landing page
- ISR (Incremental Static Regeneration) para catálogos
- No cache para datos de usuario (siempre fresh)

## Seguridad

### Capas de Seguridad
1. **Network**: HTTPS only, CORS configurado
2. **Auth**: Supabase JWT, refresh tokens
3. **Database**: RLS habilitado en todas las tablas
4. **API**: Validación de entrada con Zod
5. **Secrets**: Variables de entorno, nunca en código

### Validación de Entrada
```typescript
// Ejemplo con Zod
const onboardingSchema = z.object({
  cif_nif: cifNifSchema,
  name: z.string().min(2),
  email: z.string().email(),
  sector: z.string(),
  company_size: z.enum(['micro', 'small', 'medium']),
})

// Uso
const validatedData = onboardingSchema.parse(formData)
```

## Performance

### Métricas Target
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Time to Interactive**: < 3s

### Optimizaciones
- Code splitting automático (Next.js)
- Image optimization (next/image)
- Font optimization (next/font)
- Lazy loading de componentes pesados
- Minimal JavaScript en landing page

## Monitoreo

### Métricas de Negocio
- Tiempo de onboarding (target: < 60s)
- Compliance score accuracy
- Grant match relevance
- Document generation usage

### Métricas Técnicas
- Error rate
- API latency (p50, p95, p99)
- Database query performance
- AI generation time

### Herramientas
- Vercel Analytics (web vitals)
- Supabase Dashboard (DB metrics)
- Sentry (error tracking, futuro)

## Escalabilidad

### Límites Actuales (Free Tier)
- **Vercel**: 100GB bandwidth/mes
- **Supabase**: 500MB DB, 2GB bandwidth
- **Anthropic**: Rate limits por API key

### Plan de Escala
1. **0-100 usuarios**: Free tiers, MVP
2. **100-1000 usuarios**:
   - Vercel Pro ($20/mes)
   - Supabase Pro ($25/mes)
   - Anthropic paid tier
3. **1000+ usuarios**:
   - Considerar CDN para assets
   - Read replicas en Supabase
   - Caching layer (Redis)

## Deploy Strategy

### CI/CD Pipeline
```
Git Push → GitHub
    ↓
Vercel detecta cambios
    ↓
Build (npm run build)
    ↓
Tests (futuro)
    ↓
Preview Deploy (branches)
    ↓
Production Deploy (main)
```

### Rollback Strategy
- Vercel permite rollback instantáneo a deployments anteriores
- Database migrations versionadas
- Feature flags para features nuevas (futuro)

## Futuras Mejoras

### Corto Plazo (1-3 meses)
- [ ] Testing (Jest, Playwright)
- [ ] Notificaciones por email (Resend)
- [ ] Export de documentos a PDF
- [ ] API pública (para gestorías)

### Medio Plazo (3-6 meses)
- [ ] Integración con Registro Mercantil
- [ ] Multi-idioma (i18n)
- [ ] Mobile app (React Native)
- [ ] Webhooks para integraciones

### Largo Plazo (6-12 meses)
- [ ] Marketplace de consultores
- [ ] Integraciones contables (Sage, Holded)
- [ ] AI chat para consultas
- [ ] Analytics avanzado

---

**Última actualización**: 2024
**Versión**: 1.0 (MVP)
