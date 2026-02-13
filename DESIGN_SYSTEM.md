# Compliance OS - Design System
## "Trust & Growth" Design System

Sistema de diseño para el "Sistema Operativo de Cumplimiento y Ayudas para PYMES". Este documento define los estándares visuales, componentes y mejores prácticas para mantener consistencia en toda la aplicación.

---

## 🎨 Paleta de Colores

### Core Brand Colors

| Uso | Color | Código HEX | Sensación | Clase Tailwind |
|-----|-------|------------|-----------|----------------|
| **Primario (Deep Space)** | Azul Medianoche Profundo | `#0A1128` | Autoridad, Estabilidad | `bg-os-deep-space` / `text-os-deep-space` |
| **Acento (Neon Mint)** | Verde Eléctrico / Turquesa | `#00F5A0` | Crecimiento, Subvenciones | `bg-os-neon-mint` / `text-os-neon-mint` |
| **Superficie (Glass)** | Gris Neutro Ultra Claro | `#F8FAFC` | Limpieza, Modernidad | `bg-os-glass` |
| **Texto (Obsidian)** | Gris Casi Negro | `#1E293B` | Legibilidad Premium | `text-os-obsidian` |

### Semantic Compliance Colors

#### Critical (Rojo Soft)
- **Background:** `#FEE2E2` - `bg-compliance-critical-bg`
- **Text:** `#B91C1C` - `text-compliance-critical-text`
- **Border:** `#FCA5A5` - `border-compliance-critical-border`
- **Uso:** Multas inminentes, riesgos críticos

#### Warning (Ámbar)
- **Background:** `#FEF3C7` - `bg-compliance-warning-bg`
- **Text:** `#B45309` - `text-compliance-warning-text`
- **Border:** `#FCD34D` - `border-compliance-warning-border`
- **Uso:** Documentación expirando, advertencias

#### Success (Verde OS)
- **Background:** `#DCFCE7` - `bg-compliance-success-bg`
- **Text:** `#15803D` - `text-compliance-success-text`
- **Border:** `#86EFAC` - `border-compliance-success-border`
- **Uso:** Subvención disponible, tareas completadas

#### Info (Azul Claro)
- **Background:** `#E0F2FE` - `bg-compliance-info-bg`
- **Text:** `#0369A1` - `text-compliance-info-text`
- **Border:** `#7DD3FC` - `border-compliance-info-border`
- **Uso:** Información general, actualizaciones

---

## 📝 Tipografía

### Principal (Logotipo y Titulares)
**Inter** - Variable Font de Google Fonts

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
```

- **Por qué:** Fuente SaaS moderna con geometría perfecta
- **Uso:** Headings (h1-h6), Botones, Navegación
- **Clase:** `font-sans`

### Secundaria (Cuerpo de texto y Dashboard)
**IBM Plex Sans** - Variable Font de Google Fonts

```tsx
import { IBM_Plex_Sans } from 'next/font/google';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});
```

- **Por qué:** Diseño semi-industrial perfecto para tablas y datos
- **Uso:** Texto de párrafo, datos numéricos, tablas
- **Clase:** `font-mono`

### Escala Tipográfica

| Tamaño | Rem | Px | Uso |
|--------|-----|-----|-----|
| `text-xs` | 0.75rem | 12px | Badges, timestamps |
| `text-sm` | 0.875rem | 14px | Body small, captions |
| `text-base` | 1rem | 16px | Body text |
| `text-lg` | 1.125rem | 18px | Subtítulos |
| `text-xl` | 1.25rem | 20px | Card titles |
| `text-2xl` | 1.5rem | 24px | Section headers |
| `text-3xl` | 1.875rem | 30px | Page titles |
| `text-4xl` | 2.25rem | 36px | Hero titles |

---

## 🎭 Iconografía

**Estilo:** Linear Icons (trazo fino de 1.5pt)

- **Librería:** [Lucide React](https://lucide.dev/)
- **Stroke Width:** 1.5px
- **Tamaños comunes:** `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- **Clase helper:** `icon-linear` (aplica stroke-width: 1.5px)

```tsx
import { TrendingUp } from 'lucide-react';

<TrendingUp className="w-5 h-5 icon-linear text-primary-500" />
```

---

## 📦 Componentes

### Button

Botones con 4 variantes y 3 tamaños.

```tsx
import { Button } from '@/components/ui/Button';

// Primary (Neon Mint)
<Button variant="primary" size="md">
  Guardar
</Button>

// Secondary (Deep Space)
<Button variant="secondary" size="md">
  Cancelar
</Button>

// Ghost (Borde fino)
<Button variant="ghost" size="md">
  Ver más
</Button>

// Con icono
<Button variant="primary" icon={TrendingUp} iconPosition="left">
  Ver subvenciones
</Button>
```

**Variantes:**
- `primary`: Fondo neon-mint, texto deep-space
- `secondary`: Fondo deep-space, texto blanco
- `ghost`: Borde gris, hover neon-mint
- `danger`: Fondo rojo, para acciones destructivas

**Tamaños:**
- `sm`: Pequeño (botones secundarios)
- `md`: Medio (botones principales)
- `lg`: Grande (CTAs hero)

---

### Card

Sistema modular de tarjetas con componentes separados.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

<Card hover glass>
  <CardHeader
    title="Título"
    subtitle="Subtítulo opcional"
    icon={Building2}
  />
  <CardBody>
    Contenido
  </CardBody>
  <CardFooter>
    Acciones
  </CardFooter>
</Card>
```

**Props:**
- `hover`: Añade efecto hover con elevación
- `glass`: Aplica glassmorphism

---

### Alert

Alertas semánticas con 4 tipos.

```tsx
import { Alert } from '@/components/ui/Alert';

<Alert
  type="warning"
  title="Documento próximo a vencer"
  message="Tu certificado RGPD expira en 7 días."
  dismissible
  onDismiss={() => {}}
  action={{
    label: "Renovar ahora",
    onClick: () => {}
  }}
/>
```

**Tipos:**
- `critical`: Riesgos inminentes
- `warning`: Advertencias
- `success`: Confirmaciones
- `info`: Información general

---

### Badge

Badges para estados y categorías.

```tsx
import { Badge, ComplianceStatusBadge, GrantStatusBadge } from '@/components/ui/Badge';

// Badge genérico
<Badge variant="success" size="md">
  Activo
</Badge>

// Badge de estado de compliance
<ComplianceStatusBadge status="pending" />

// Badge de estado de subvención
<GrantStatusBadge status="opportunity" />
```

---

### ComplianceScore

Indicador visual del Compliance Score con semáforo.

```tsx
import { ComplianceScore, ComplianceScoreCard } from '@/components/compliance/ComplianceScore';

// Versión simple
<ComplianceScore
  score={75}
  previousScore={68}
  size="lg"
  showTrend
  showLabel
/>

// Versión en Card
<ComplianceScoreCard
  score={75}
  previousScore={68}
  title="Compliance Score"
  subtitle="Estado de cumplimiento normativo"
/>
```

**Lógica de colores:**
- 80-100: Verde (Excelente)
- 60-79: Ámbar (Mejorable)
- 0-59: Rojo (Requiere atención)

---

### GrantCard

Tarjeta de subvención con match score y deadline.

```tsx
import { GrantCard } from '@/components/grants/GrantCard';

<GrantCard
  grant={grantData}
  matchScore={85}
  status="opportunity"
  onApply={() => {}}
  onViewDetails={() => {}}
/>
```

**Características:**
- Match score con badge destacado
- Progress bar de probabilidad
- Detección de urgencia (deadline < 7 días)
- Estados: opportunity, in_progress, submitted, rejected, approved

---

### ComplianceTaskCard

Tarjeta de tarea de compliance con severidad.

```tsx
import { ComplianceTaskCard } from '@/components/compliance/ComplianceTaskCard';

<ComplianceTaskCard
  id={task.id}
  requirement={requirementData}
  status="pending"
  dueDate="2026-03-01"
  onViewDetails={() => {}}
/>
```

**Severidad:**
- `critical`: Borde rojo, icono AlertCircle
- `high`: Borde amarillo, icono AlertCircle
- `medium/low`: Borde azul, icono Clock

---

## 🎨 Estilos Visuales

### Border Radius
- `rounded-os`: 8px (componentes estándar)
- `rounded-os-lg`: 12px (cards principales)
- `rounded-full`: Círculos y pills

### Shadows (Semantic)
- `shadow-os`: Sombra sutil para cards
- `shadow-os-md`: Sombra media para hover
- `shadow-os-lg`: Sombra grande para modales
- `shadow-os-xl`: Sombra extra grande para overlays

### Glassmorphism
```css
.glass {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

Uso: Barras laterales, overlays

### Mesh Gradient (Hero Sections)
```tsx
<div className="mesh-gradient min-h-screen">
  {/* Hero content */}
</div>
```

Gradiente animado en tonos azules/deep-space.

---

## 📐 Layout

### Bento Grid
Sistema de grid inspirado en Apple.

```tsx
<div className="bento-grid">
  <div className="bento-card">Card 1</div>
  <div className="bento-card">Card 2</div>
  <div className="bento-card">Card 3</div>
</div>
```

- Responsive: 1 columna (mobile) → 2 (tablet) → 3 (desktop)
- Gap: 24px (1.5rem)

---

## 🎬 Animaciones

### Transitions
```tsx
// Duración
transition-all duration-300 // Estándar
transition-all duration-500 // Lenta

// Con easing
ease-out
ease-in-out
```

### Animaciones predefinidas
- `animate-fade-in`: Fade in (0.5s)
- `animate-slide-up`: Slide up (0.4s)
- `animate-scale-in`: Scale in (0.3s)

---

## 🎯 Reglas de Uso del Logo

### Zona de Seguridad
- Espacio libre alrededor del logo = altura de la "C"
- Clase helper: `logo-safe-area`

### Uso sobre color
- **Fondos oscuros** (#0A1128): Isotipo en verde neón (#00F5A0)
- **Fondos blancos**: Isotipo en azul profundo con detalles en verde

### Prohibiciones
❌ No usar sombras paralelas
❌ No deformar proporciones
❌ No usar más de 3 colores en el isotipo

---

## 📱 Responsive Design

### Breakpoints (Tailwind default)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Estrategia Mobile-First
Todos los componentes están diseñados mobile-first y escalan progresivamente.

---

## 🚀 Uso del Sistema

### Importar componentes
```tsx
// Componentes UI base
import { Button, Card, Alert, Badge } from '@/components/ui';

// Componentes específicos
import { ComplianceScore } from '@/components/compliance/ComplianceScore';
import { GrantCard } from '@/components/grants/GrantCard';

// Tokens de diseño
import { colors, typography, spacing } from '@/lib/design-tokens';
```

### Tokens de diseño centralizados
Usa `/src/lib/design-tokens.ts` para acceder a valores programáticos:

```tsx
import { getScoreColor, getComplianceColor } from '@/lib/design-tokens';

const scoreColor = getScoreColor(75); // Retorna objeto de color
```

---

## 📋 Checklist de Implementación

### Para nuevos componentes:
- [ ] Usar paleta "Trust & Growth"
- [ ] Aplicar fuentes Inter/IBM Plex Sans
- [ ] Usar border-radius semánticos (8px/12px)
- [ ] Añadir transiciones suaves (300ms)
- [ ] Implementar estados hover/focus
- [ ] Diseñar mobile-first
- [ ] Usar iconos Linear style (1.5px stroke)
- [ ] Añadir semantic color classes
- [ ] Documentar props en TypeScript
- [ ] Probar en mobile/tablet/desktop

---

## 🎨 Landing Page - Hero Section

### Estilo visual
```tsx
<section className="mesh-gradient min-h-screen flex items-center">
  <div className="container mx-auto px-6">
    <h1 className="text-5xl font-bold text-white mb-4">
      Compliance is now automated.
      <br />
      <span className="text-primary-500">Grants are now visible.</span>
    </h1>
  </div>
</section>
```

### Social Proof
Logotipos de partners en escala de grises (opacity: 0.5), color al hover.

```tsx
<img
  src="/partners/logo.svg"
  className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
/>
```

---

## 🧩 Composición de Componentes

### Ejemplo: Dashboard Card con Score
```tsx
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ComplianceScore } from '@/components/compliance/ComplianceScore';
import { TrendingUp } from 'lucide-react';

function DashboardScoreCard() {
  return (
    <Card hover>
      <CardHeader
        title="Compliance Score"
        subtitle="Estado de cumplimiento normativo"
        icon={TrendingUp}
      />
      <CardBody>
        <ComplianceScore
          score={82}
          previousScore={75}
          showTrend
          showLabel
        />
      </CardBody>
    </Card>
  );
}
```

---

## 🎓 Mejores Prácticas

### Semántica de colores
✅ **Hacer:** Usar colores semánticos (`compliance-critical-bg`)
❌ **Evitar:** Usar colores crudos (`bg-red-100`)

### Consistencia tipográfica
✅ **Hacer:** Usar clases de fuente (`font-sans`, `font-mono`)
❌ **Evitar:** Inline styles de fuente

### Componentes reutilizables
✅ **Hacer:** Componer componentes del design system
❌ **Evitar:** Recrear estilos en cada página

### Accesibilidad
- Contraste mínimo 4.5:1 para texto
- Todos los iconos con texto alternativo
- Estados focus visibles
- Navegación por teclado

---

## 📦 Archivos del Sistema

```
src/
├── lib/
│   └── design-tokens.ts          # Tokens centralizados
├── components/
│   ├── ui/
│   │   ├── Button.tsx             # Botones
│   │   ├── Card.tsx               # Cards modulares
│   │   ├── Alert.tsx              # Alertas semánticas
│   │   ├── Badge.tsx              # Badges y estados
│   │   └── index.ts               # Exports
│   ├── compliance/
│   │   ├── ComplianceScore.tsx    # Score widget
│   │   └── ComplianceTaskCard.tsx # Task cards
│   └── grants/
│       └── GrantCard.tsx          # Grant cards
└── app/
    └── globals.css                # Estilos base y utilities

tailwind.config.ts                 # Configuración Tailwind
```

---

## 🔄 Actualizaciones

**Última actualización:** 2026-02-13
**Versión:** 1.0.0
**Mantenedor:** Compliance OS Team

Para sugerencias o mejoras al sistema de diseño, abre un issue en el repositorio.

---

**"Technology that works for you."**
