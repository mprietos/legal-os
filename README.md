# Legal OS - Sistema Operativo de Cumplimiento para PYMEs

Sistema SaaS B2B que reduce riesgo legal (compliance) y aumenta ingresos no dilutivos (subvenciones) para PYMEs europeas y latinoamericanas.

## 🚀 Características Principales

### 1. Onboarding Automático (< 60 segundos)
- Validación de CIF/NIF con inferencia automática de:
  - Sector de actividad
  - Tamaño de empresa
  - País y región
- Creación de perfil empresarial

### 2. Motor de Matching Inteligente
- **Compliance**: Evaluación automática de requisitos legales aplicables
- **Subvenciones**: Detección de ayudas con scoring de match (0-100)
- Algoritmo de priorización basado en severidad y plazos

### 3. Dashboard Accionable
- **Compliance Score** (0-100) con visualización semáforo
- Lista priorizada de tareas de compliance
- Oportunidades de subvenciones ordenadas por relevancia
- Lenguaje claro y orientado a acción

### 4. Generación de Documentos con IA (Claude)
- Solicitudes de subvenciones personalizadas
- Políticas de compliance
- Reportes ejecutivos
- Guías de acción paso a paso

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **IA**: Anthropic Claude 3.5 Sonnet
- **Despliegue**: Vercel

### Modelos de Datos

#### Companies
- Datos de identificación (CIF, nombre, email)
- Características (sector, tamaño, empleados, facturación)
- Compliance score
- Plan de suscripción (free/pro/business)

#### Compliance Requirements (Catálogo)
- Requisitos legales por país/sector/tamaño
- Severidad (critical/high/medium/low)
- Frecuencia (mensual/trimestral/anual)
- Pasos de acción y documentación

#### Company Compliance (Estado)
- Relación empresa-requisito
- Estado (pending/in_progress/completed)
- Prioridad y fechas de vencimiento

#### Grants (Catálogo de Ayudas)
- Subvenciones por país/sector/tamaño
- Importes máximos
- Plazos de solicitud
- Requisitos y documentación

#### Company Grants (Matching)
- Relación empresa-subvención
- Score de match (0-100)
- Estado de solicitud

#### Generated Documents
- Documentos generados con IA
- Versionado y control

## 📋 Setup e Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase
- API Key de Anthropic Claude

### Variables de Entorno

Crea un archivo `.env.local` con:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Anthropic Claude
ANTHROPIC_API_KEY=tu_anthropic_api_key
```

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar Supabase
# 1. Crea un proyecto en Supabase
# 2. Ejecuta el script supabase/schema.sql en el SQL Editor
# 3. (Opcional) Ejecuta supabase/seed.sql para datos de ejemplo

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🚢 Despliegue en Vercel

### Paso 1: Conectar Repositorio
1. Sube el código a GitHub
2. Importa el proyecto en Vercel
3. Vercel detectará automáticamente Next.js

### Paso 2: Configurar Variables de Entorno
En el dashboard de Vercel, añade:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

### Paso 3: Deploy
```bash
# Usando Vercel CLI
npm i -g vercel
vercel --prod
```

## 🗂️ Estructura del Proyecto

```
legal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/
│   │   │   └── login/           # Autenticación
│   │   ├── onboarding/          # Onboarding de empresas
│   │   │   └── matching/        # Matching engine
│   │   ├── dashboard/           # Dashboard principal
│   │   └── api/
│   │       ├── matching/        # API de matching
│   │       └── generate-document/ # API de generación de docs
│   ├── lib/
│   │   ├── supabase/            # Clientes de Supabase
│   │   ├── validators/          # Validación de CIF/NIF
│   │   ├── matching-engine.ts   # Motor de matching
│   │   └── ai/
│   │       └── document-generator.ts # Generador de docs con IA
│   └── types/
│       └── database.ts          # Types de TypeScript
├── supabase/
│   ├── schema.sql               # Schema de base de datos
│   └── seed.sql                 # Datos de ejemplo
├── package.json
└── README.md
```

## 🎯 Roadmap MVP

- [x] Configuración de proyecto Next.js + Supabase
- [x] Sistema de autenticación
- [x] Onboarding con validación de CIF/NIF
- [x] Motor de matching (compliance + grants)
- [x] Dashboard con Compliance Score
- [x] Generación de documentos con IA
- [x] Configuración para Vercel
- [ ] Testing y optimización
- [ ] Integración con API de Registro Mercantil (opcional)
- [ ] Sistema de notificaciones (email)

## 💼 Planes y Monetización

### Free
- 1 empresa
- Compliance Score básico
- Hasta 3 documentos generados/mes

### Pro (€49/mes)
- 1 empresa
- Compliance Score avanzado
- Documentos ilimitados
- Alertas y recordatorios
- Soporte prioritario

### Business (€199/mes)
- Hasta 10 empresas (gestorías)
- Todo lo de Pro
- API access
- Onboarding asistido

## 🔒 Seguridad

- Row Level Security (RLS) en Supabase
- Autenticación JWT
- Variables de entorno para secretos
- Validación de datos con Zod

## 📊 Métricas de Éxito

- **Time to Value**: < 60 segundos
- **Compliance Score accuracy**: > 85%
- **Grant match relevance**: > 70%
- **Document generation quality**: > 80% satisfaction

## 🤝 Contribución

Este es un proyecto MVP. Para mejoras:
1. Fork del repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit (`git commit -m 'Añade nueva funcionalidad'`)
4. Push (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

## 🆘 Soporte

Para issues y soporte, contacta a través del dashboard de la aplicación.

---

**Desarrollado con Next.js, Supabase y Claude AI**
