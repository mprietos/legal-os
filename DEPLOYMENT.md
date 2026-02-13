# Guía de Despliegue - Legal OS

## Despliegue en Vercel + Supabase

Esta guía te llevará paso a paso para desplegar el MVP de Legal OS en producción.

---
EaC36HvZiZKrmLgm

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Clic en "New Project"
4. Configura:
   - **Name**: legal-os (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Elige la más cercana a tus usuarios (Europe West, US East, etc.)
   - **Pricing Plan**: Free (suficiente para MVP)
5. Espera 2-3 minutos mientras se crea el proyecto

### 1.2 Ejecutar Schema de Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor** (icono </> en el menú lateral)
2. Clic en "New query"
3. Copia y pega el contenido completo de `supabase/schema.sql`
4. Clic en "Run" (esquina inferior derecha)
5. Verifica que se ejecutó sin errores (deberías ver "Success. No rows returned")

### 1.3 (Opcional) Cargar Datos de Ejemplo

1. En el mismo SQL Editor, crea otra "New query"
2. Copia y pega el contenido de `supabase/seed.sql`
3. Clic en "Run"
4. Esto cargará requisitos de compliance y subvenciones de ejemplo para España

### 1.4 Obtener Credenciales

1. Ve a **Project Settings** (icono de engranaje en el menú lateral)
2. En la sección **API**, encontrarás:
   - **Project URL**: Cópiala (será tu `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key**: Cópiala (será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Ve a la pestaña **Database**
4. Scroll hasta "Connection string"
5. Copia el **Service Role** key (será tu `SUPABASE_SERVICE_ROLE_KEY`)

**⚠️ IMPORTANTE**: Guarda estas credenciales en un lugar seguro. No las compartas ni las subas a GitHub.

---

## Paso 2: Obtener API Key de Anthropic

### 2.1 Crear Cuenta en Anthropic

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### 2.2 Generar API Key

1. En el dashboard, ve a **API Keys**
2. Clic en "Create Key"
3. Dale un nombre: "Legal OS Production"
4. Copia la key (será tu `ANTHROPIC_API_KEY`)

**⚠️ IMPORTANTE**: Esta key solo se muestra una vez. Guárdala de inmediato.

### 2.3 Añadir Créditos (si es necesario)

- Anthropic ofrece $5 de crédito gratuito para nuevas cuentas
- Para producción, añade una tarjeta de crédito en **Billing**
- El costo estimado para 100 usuarios/mes: ~$20-50

---

## Paso 3: Preparar el Código

### 3.1 Crear Repositorio en GitHub

```bash
# Inicializar git (si no lo has hecho)
cd /Users/miguelprieto/Desktop/mios/custom/legal
git init

# Añadir archivos
git add .

# Primer commit
git commit -m "Initial commit - Legal OS MVP"

# Crear repositorio en GitHub (usando GitHub CLI)
gh repo create legal-os --private --source=. --remote=origin

# O si prefieres hacerlo manualmente:
# 1. Ve a github.com
# 2. New repository → "legal-os"
# 3. Marca como Private
# 4. No inicialices con README (ya lo tienes)

# Push
git branch -M main
git push -u origin main
```

### 3.2 Verificar .gitignore

Asegúrate de que `.gitignore` incluye:
```
node_modules/
.next/
.env
.env.local
.env*.local
.vercel
```

**⚠️ NUNCA** subas archivos `.env` con credenciales a GitHub.

---

## Paso 4: Desplegar en Vercel

### 4.1 Conectar Vercel con GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta o inicia sesión
3. Clic en "Add New..." → "Project"
4. Conecta tu cuenta de GitHub si es la primera vez
5. Busca el repositorio `legal-os`
6. Clic en "Import"

### 4.2 Configurar el Proyecto

En la pantalla de configuración:

1. **Framework Preset**: Next.js (detectado automáticamente)
2. **Root Directory**: ./
3. **Build Command**: `npm run build` (por defecto)
4. **Output Directory**: `.next` (por defecto)
5. **Install Command**: `npm install` (por defecto)

### 4.3 Añadir Variables de Entorno

En la sección **Environment Variables**, añade las siguientes:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | La URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | La service role key de Supabase |
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic |

**Tip**: Añádelas para todos los entornos (Production, Preview, Development)

### 4.4 Deploy

1. Clic en "Deploy"
2. Vercel comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias
   - Ejecutar el build
   - Desplegar
3. El proceso toma ~2-5 minutos
4. ¡Listo! Tu app estará en `https://legal-os.vercel.app` (o similar)

---

## Paso 5: Verificar el Despliegue

### 5.1 Smoke Tests

1. **Landing Page**: Ve a tu URL de Vercel
   - ✅ Debe cargar sin errores
   - ✅ Botones "Comenzar ahora" deben funcionar

2. **Registro**: Clic en "Comenzar ahora"
   - ✅ Crea una cuenta con tu email
   - ✅ Verifica que recibes email de confirmación

3. **Onboarding**: Después del registro
   - ✅ Introduce un CIF de prueba (ej: A12345678)
   - ✅ Completa el formulario
   - ✅ Verifica que el matching funciona

4. **Dashboard**: Después del onboarding
   - ✅ Debe mostrar Compliance Score
   - ✅ Debe listar tareas de compliance
   - ✅ Debe mostrar subvenciones disponibles

### 5.2 Revisar Logs

Si algo falla:

1. En Vercel, ve a tu proyecto
2. Pestaña **Logs** → **Functions**
3. Revisa errores en tiempo real
4. Busca errores de API (endpoints `/api/*`)

### 5.3 Verificar Base de Datos

1. En Supabase, ve a **Table Editor**
2. Revisa que se crearon registros en:
   - `companies` (tu empresa de prueba)
   - `company_compliance` (requisitos asignados)
   - `company_grants` (subvenciones detectadas)

---

## Paso 6: Configuración Post-Deploy

### 6.1 Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a **Settings** → **Domains**
2. Añade tu dominio (ej: `legalos.com`)
3. Configura DNS según las instrucciones de Vercel
4. Espera propagación (5-60 minutos)
5. Vercel configurará HTTPS automáticamente

### 6.2 Configurar Email Redirect en Supabase

1. En Supabase, ve a **Authentication** → **URL Configuration**
2. Añade tu dominio de Vercel a **Site URL**
3. En **Redirect URLs**, añade:
   - `https://tu-dominio.vercel.app/auth/callback`
   - Si tienes dominio custom: `https://tudominio.com/auth/callback`

### 6.3 Optimizar Performance

1. **Vercel Analytics**:
   - Ve a **Analytics** en Vercel
   - Habilita "Web Vitals"
   - Monitorea LCP, FID, CLS

2. **Supabase Connection Pooling**:
   - Si tienes muchos usuarios, habilita Pooling en Supabase
   - **Settings** → **Database** → Enable pooling

---

## Paso 7: Monitoreo y Mantenimiento

### 7.1 Configurar Alertas

**Vercel**:
1. **Settings** → **Notifications**
2. Habilita alertas para:
   - Deployment failures
   - Performance degradation

**Supabase**:
1. **Settings** → **Notifications**
2. Habilita alertas para:
   - Database usage (cuando llegues al 80% del plan)
   - API usage

### 7.2 Backups

**Base de Datos**:
- Supabase hace backups automáticos diarios (retenidos 7 días en Free tier)
- Para backups manuales: **Database** → **Backups** → "Backup now"

**Código**:
- GitHub guarda todo tu código
- Vercel mantiene historial de deployments (puedes hacer rollback)

### 7.3 Actualizaciones

Cuando hagas cambios en el código:

```bash
# Hacer cambios en tu código local
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel detectará el push y desplegará automáticamente en ~2 minutos.

---

## Troubleshooting Común

### Error: "Invalid Supabase credentials"

**Solución**:
1. Verifica que las variables de entorno en Vercel están correctas
2. Asegúrate de copiar las keys completas (sin espacios extra)
3. Re-deploy después de cambiar variables

### Error: "Anthropic API rate limit"

**Solución**:
1. Verifica que tienes créditos en tu cuenta de Anthropic
2. Considera añadir una tarjeta de crédito
3. Implementa rate limiting en el código (futuro)

### Error: "Database connection failed"

**Solución**:
1. Verifica que el proyecto de Supabase está activo
2. Revisa que la IP de Vercel no está bloqueada
3. En Supabase: **Settings** → **Database** → "Reset database password"

### Error: "Build failed"

**Solución**:
1. Verifica que todas las dependencias están en `package.json`
2. Revisa los logs de build en Vercel
3. Asegúrate de que el build funciona localmente: `npm run build`

---

## Costos Estimados

### Free Tier (0-100 usuarios)
- **Vercel**: $0
- **Supabase**: $0
- **Anthropic**: ~$10-20/mes (depende de uso)
- **Total**: ~$10-20/mes

### Pro Tier (100-1000 usuarios)
- **Vercel Pro**: $20/mes
- **Supabase Pro**: $25/mes
- **Anthropic**: ~$50-100/mes
- **Total**: ~$95-145/mes

### Límites Free Tier

**Vercel**:
- 100GB bandwidth/mes
- Deployments ilimitados
- Funciones serverless ilimitadas

**Supabase**:
- 500MB base de datos
- 2GB bandwidth/mes
- 50,000 usuarios activos mensuales

**Anthropic**:
- Sin free tier permanente
- $5 crédito inicial para nuevas cuentas
- Pay-as-you-go después

---

## Siguientes Pasos

Una vez desplegado:

1. **Testing**: Invita a 5-10 usuarios beta
2. **Feedback**: Crea un formulario de feedback
3. **Analytics**: Configura Google Analytics o similar
4. **Marketing**: Crea landing page optimizada para SEO
5. **Iteración**: Mejora basándote en métricas de uso

---

## Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel
2. Consulta la documentación:
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Vercel](https://vercel.com/docs)
3. Busca en GitHub Issues similares
4. Contacta al equipo de soporte de cada plataforma

---

**¡Felicidades! Tu MVP de Legal OS está en producción.** 🚀
