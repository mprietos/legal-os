# Matching Engine v2 - Documentación Técnica y Guía de Migración

Este documento detalla la implementación del nuevo Motor de Matching Inteligente (v2), incluyendo los cambios en base de datos, la lógica de negocio y las instrucciones para desplegarlo.

## 1. Resumen de Cambios

El objetivo ha sido evolucionar el sistema de ayudas hacia un motor heurístico capaz de calcular un **Score de Elegibilidad** (0-100), estimar el **Impacto Económico** y generar **Explicaciones** claras para el usuario.

### Componentes Afectados
- **Base de Datos**: Nuevas columnas y tablas en Supabase.
- **Backend (Lógica)**: Nuevo módulo `src/lib/matching/` con el motor de reglas.
- **API**: Nuevo endpoint `/api/cron/match-all`.
- **Frontend**: Actualización de la página de ayudas para mostrar explicaciones.

---

## 2. API de Matching

He creado un endpoint para ejecutar el matching masivo (ideal para cron jobs).

**Ruta**: `/api/cron/match-all`
**Método**: `GET`
**Lógica**:
1.  Carga todas las ayudas activas y reglas de scoring.
2.  Itera sobre todas las empresas.
3.  Ejecuta `MatchingEngine.evaluate()`.
4.  Guarda en `company_grants` si el score > 30.

**Respuesta**:
```json
{
  "success": true,
  "processed": {
    "companies": 150,
    "grants": 12,
    "total_combinations": 1800
  },
  "matches_found": 45
}
```

---

## 3. Cambios en Frontend

La página `/dashboard/grants` ahora muestra:
-   **Por qué te encaja**: Lista de razones generadas por el motor (ej. "Tu sector coincide").
-   **Estimación Económica**: Muestra el monto estimado calculado por las heurísticas.

---

## 4. Cambios en Base de Datos (Schema)

Se han modificado las tablas `companies`, `grants` y `company_grants`, y se ha creado la tabla `scoring_rules`.

### Script de Migración SQL
Ejecuta este script en tu Editor SQL de Supabase para aplicar los cambios:

```sql
-- 1. Actualizar tabla COMPANIES (Añadir CNAE)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cnae_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS cnae_description VARCHAR(255);

-- 2. Actualizar tabla GRANTS (Criterios de Matching Avanzados)
ALTER TABLE grants 
ADD COLUMN IF NOT EXISTS regions VARCHAR(100)[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS permitted_cnae_codes VARCHAR(10)[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS min_revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS max_revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS estimation_params JSONB; -- { "base_amount": 2000, "per_employee": 500, "max_cap": 5000 }

-- 3. Actualizar tabla COMPANY_GRANTS (Guardar resultado del matching)
ALTER TABLE company_grants 
ADD COLUMN IF NOT EXISTS match_data JSONB; -- Snapshot del score y explicaciones

-- 4. Crear tabla de REGLAS DE SCORING
CREATE TABLE IF NOT EXISTS scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10,
  config JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  description VARCHAR(255)
);

-- 5. Insertar reglas por defecto
INSERT INTO scoring_rules (rule_type, weight, description) VALUES
('sector_match', 40, 'Coincidencia de sector industrial'),
('company_size_match', 20, 'Coincidencia de tamaño de empresa'),
('region_match', 15, 'Coincidencia de región/CCAA'),
('cnae_match', 15, 'Coincidencia específica de CNAE'),
('financial_match', 10, 'Compatibilidad financiera')
ON CONFLICT DO NOTHING;
```
