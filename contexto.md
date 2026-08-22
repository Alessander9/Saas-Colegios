# 📊 CONTEXTO Y ESTADO ACTUAL DEL PROYECTO
## Plataforma Integral de Gestión Educativa SaaS Multi-Tenant

> **PROPÓSITO DE ESTE DOCUMENTO:**
> Este archivo representa la **memoria viva y el estado de avance del proyecto**. Debe ser consultado y actualizado de manera continua por cualquier desarrollador o agente de IA para saber con exactitud **qué se ha construido**, **cuál es la arquitectura vigente**, **qué fase está activa** y **cuál es la siguiente tarea inmediata**.

---

## 📌 1. Ficha Resumen del Proyecto

| Parámetro | Detalle |
|---|---|
| **Nombre del Proyecto** | Plataforma Integral de Gestión Educativa SaaS |
| **Tipo de Arquitectura** | Monolito Modular con código Hexagonal/DDD hacia Microservicios |
| **Modelo Multi-Tenancy** | Multi-tenant por columna (	enant_id obligatorio) con esquemas por dominio |
| **Stack Principal** | NestJS (Backend) + Next.js (Frontend) + PostgreSQL + Redis + RabbitMQ |
| **Fase Actual Activa** | **Fase 4 — Enrollment (Admisiones y Matrículas)** (Fase 3 Completada) |
| **Estado General** | 🟢 **Fase 3 School Core Implementada y Validada** |
| **Fecha de Última Actualización** | 2026-08-22 |

---

## 🏗️ 2. Lo que se ha Construido y Completado

### ✅ 2.1 Especificaciones y Arquitectura Integral
* [x] **Organización Modular Completa:** 116 archivos .md divididos en 5 partes en [docs/](./docs/README.md), preservando el 100% del contenido de requerimientos y diseño.
* [x] **Contrato de Arquitectura Vinculante:** [docs/CONTRATO_DE_ARQUITECTURA.md](./docs/CONTRATO_DE_ARQUITECTURA.md) y [AGENTS.md](./AGENTS.md) con las normas innegociables (Multi-tenancy, Entitlements, Núcleo Financiero, Ownership, Outbox e Idempotencia).
* [x] **Guía Maestra de Construcción:** [GUIA_DE_CONSTRUCCION.md](./GUIA_DE_CONSTRUCCION.md) detallando la secuencia de desarrollo paso a paso desde la Fase 0 a la Fase 12.
* [x] **Catálogo de Módulos (25 dominios):** Super Admin, Suscripciones, Entitlements, Seguridad, Alumnos, Matrículas, Académico, Finanzas, RRHH, Planilla, Tienda, Actividades, Comunicaciones, Portales y Núcleos transversales.

---

## 🚦 3. Matriz de Estado por Fases (Roadmap)

| Fase | Nombre del Módulo / Hito | Estado | Progreso | Bloqueadores / Notas |
|:---:|---|:---:|:---:|---|
| **Doc** | **Especificación y Contrato de Arquitectura** | 🟢 **COMPLETADO** | 100% | 116 archivos .md + Contratos generados |
| **Fase 0** | **Engineering Foundation (Monorepo, Docker, DB)** | 🟢 **COMPLETADO** | 100% | Monorepo Turborepo + pnpm, packages, core-api NestJS, apps Next.js, Prisma, Outbox |
| **Fase 1** | **Platform Core (Tenants, Planes, Billing)** | 🟢 **COMPLETADO** | 100% | CRUD Tenants, Catálogo Planes, Subscripciones, Entitlements Engine, Overrides, UI Super Admin |
| **Fase 2** | **Identity & Authorization (Auth, Roles, RBAC)** | 🟢 **COMPLETADO** | 100% | Auth JWT multi-tenant, Roles globales y de colegio, Guardias @RequirePermission, Impersonación |
| **Fase 3** | **School Core (Institución, Sedes, Periodos)** | 🟢 **COMPLETADO** | 100% | Config institucional, Sedes/Campus, Periodos Lectivos, Jerarquía Nivel -> Grado -> Sección, UI Admin |
| **Fase 4** | **Enrollment (Admisiones y Matrículas)** | 🟡 **LISTO PARA INICIAR** | 0% | Alumnos, Familias/Apoderados, Postulaciones, Matrícula formal, Eventos StudentCreated, EnrollmentConfirmed |
| **Fase 5** | **Financial Core (Finanzas, Pagos, Caja)** | ⚪ Pendiente | 0% | Depende de Fase 4 |
| **Fase 6** | **Academic (Currículo, Notas, Asistencia)** | ⚪ Pendiente | 0% | Depende de Fase 4 |
| **Fase 7** | **Portales Web (Padres, Docente, Alumno)** | ⚪ Pendiente | 0% | Depende de Fases 4, 5 y 6 |
| **Fase 8** | **Commerce (Tienda Virtual del Colegio)** | ⚪ Pendiente | 0% | Depende de Fase 5 |
| **Fase 9** | **Activities (Eventos, Talleres y Paseos)** | ⚪ Pendiente | 0% | Depende de Fase 5 |
| **Fase 10** | **HR & Payroll (Personal y Planilla)** | ⚪ Pendiente | 0% | Depende de Fase 3 |
| **Fase 11** | **Reporting & BI (Métricas y Dashboards)** | ⚪ Pendiente | 0% | Depende de Fases anteriores |
| **Fase 12** | **Scale, Hardening & Launch (Producción)** | ⚪ Pendiente | 0% | Fase final previa al lanzamiento |

---

## 🏛️ 4. Decisiones de Arquitectura Registradas (ADRs)

1. **ADR-001: Monolito Modular con Código Hexagonal:** Para evitar sobrecarga de red y complejidad prematura, todos los dominios convivirán inicialmente en una solución NestJS con separación estricta por módulos y esquemas SQL, facilitando la extracción a microservicios independientes en el futuro.
2. **ADR-002: Multi-Tenancy Estricto:** Toda tabla de colegio requiere 	enant_id obligatorio indexado y filtrado por middleware. Acceso cross-tenant denegado por defecto.
3. **ADR-003: Motor de Entitlements Centralizado:** El acceso a características no se controla solo por roles, sino por derechos comerciales (EntitlementService) verificados contra el plan de suscripción del colegio y cuotas de uso consumidas (Usage Metering).
4. **ADR-004: Núcleo Financiero Inmutable y Transaccional:** Todos los cobros (matrículas, pensiones, tienda, actividades) comparten el núcleo transaccional. No se admiten borrados de transacciones; solo notas de crédito o reversiones.
5. **ADR-005: Outbox Pattern e Idempotencia:** Consistencia eventual garantizada para eventos de dominio (EnrollmentConfirmed, PaymentCompleted) con reintentos y deduplicación por vent_id y cabeceras Idempotency-Key.

---

## 🎯 5. Próxima Tarea Inmediata (Next Actions)

### 🚀 Tarea Inmediata: Iniciar Fase 4 — Enrollment (Admisiones y Matrículas)
1. **Modelado y Esquema de Base de Datos para Enrollment & Students** (`Student`, `Guardian`, `StudentGuardian`, `AdmissionApplication`, `Enrollment`, `EnrollmentStatus`).
2. **StudentModule & EnrollmentModule en `core-api`** con registro de ficha única del alumno, vinculación familiar y ciclo de vida de admisión.
3. **Flujo de Matrícula y Asignación de Sección** con validación de cuotas (`EntitlementService.checkUsage('students')`).
4. **Emisión de Eventos Outbox**: `StudentCreated.v1`, `EnrollmentConfirmed.v1`.
5. **Pruebas Unitarias e Integración** para Admisión y Matrícula formal.

---

## 📝 6. Registro de Cambios e Historial (Change Log)

### [2026-08-22] — Implementación y Validación de la Fase 3 (School Core)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos multi-tenant con modelos de School Core (`SchoolProfile`, `Campus`, `AcademicYear`, `AcademicPeriod`, `EducationalLevel`, `GradeLevel`, `Section`, `Classroom`).
  * Creación de `SchoolCoreService` y `SchoolCoreController` en `core-api` con aislamiento estricto por `tenant_id` y protección de rutas con `@RequirePermission`.
  * Cobertura de tests unitarios al 100% para `SchoolCoreService` (perfil institucional, unicidad de códigos de sede, periodos y años lectivos).
  * Implementación de interfaz interactiva en `apps/web-school-admin` con tarjetas KPI, visualización de sedes, tabla de secciones jerárquicas y modal para apertura de nuevas aulas/secciones.
  * Verificación integral del monorepo (`turbo run build` y `turbo run test` pasando al 100%).
* **Próximo Paso Acordado:** Iniciar la **Fase 4 (Enrollment — Admisiones y Matrículas)**.

### [2026-08-22] — Implementación y Validación de la Fase 2 (Identity & Authorization)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Implementación de catálogo completo de roles (`SUPER_ADMIN`, `SUPPORT_AGENT`, `DIRECTOR`, `ADMINISTRATOR`, `SECRETARY`, `TEACHER`, `ACCOUNTANT`, `PARENT`, `STUDENT`) y mapeo a permisos granulares (`RolePermissionsMap`).
  * Creación de `AuthGuard` multi-tenant (resolución de `tenant_id` por membresía o cabecera `x-tenant-id`) y `PermissionGuard` (@RequirePermission, @RequireRole).
  * Implementación de `AuthService` con registro, hashing seguro Bcrypt, login JWT multi-tenant y modo impersonación con auditoría obligatoria en `audit_logs`.
  * Creación de `IdentityModule` y `AuthController` con endpoints documentados en OpenAPI (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/impersonate`).
  * Cobertura de tests unitarios al 100% en `AuthService` y `PermissionGuard`.
* **Próximo Paso Acordado:** Iniciar la **Fase 3 (School Core)**.

### [2026-08-22] — Implementación y Validación de la Fase 1 (Platform Core & SaaS Engine)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Extensión del esquema de base de datos (`Tenant`, `Plan`, `Subscription`, `AddOn`, `TenantOverride`, `TenantUsage`).
  * Implementación del motor central `EntitlementService` con caché en memoria/Redis, validación de estado del tenant, features y cuotas numéricas (`checkUsage`, `recordUsage`).
  * Creación del decorador `@RequireFeature()` y el guard global `FeatureGuard`.
  * Creación de `PlatformModule` y `PlatformController` en `core-api` para provisión de tenants (con emisión de evento `TenantCreated.v1` vía Outbox), catálogo de planes, overrides de cuotas y métricas de plataforma.
  * Implementación de tests unitarios al 100% para `EntitlementService` y `PlatformService`.
  * Creación del panel de gestión interactivo en `apps/web-platform-admin` con métricas, tabla de tenants y catálogo de planes.
* **Próximo Paso Acordado:** Iniciar la **Fase 2 (Identity & Authorization)**.

### [2026-08-22] — Implementación y Validación de la Fase 0 (Engineering Foundation)
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Configuración completa de Monorepo con Turborepo + pnpm workspaces.
  * Definición de `docker-compose.yml` (PostgreSQL 16, Redis 7, RabbitMQ 3, MinIO).
  * Creación de packages compartidos: `@cole/domain-types` (contratos, eventos, roles, permisos), `@cole/logger` (JSON estructurado), `@cole/database` (Prisma schema multi-tenant + Outbox + AuditLog), `@cole/ui-components` (React UI primitives).
  * Creación de servicio backend `services/core-api` (NestJS modular, Swagger OpenAPI, GlobalExceptionFilter, ObservabilityInterceptor con Correlation IDs, EventBus y Health Module con pruebas unitarias).
  * Creación de apps frontend Next.js App Router: `apps/web-platform-admin` y `apps/web-school-admin`.
  * Validación integral del monorepo (`turbo run build` y `turbo run test` pasando al 100%).
* **Próximo Paso Acordado:** Iniciar la **Fase 1 (Platform Core & SaaS Engine)**.

### [2026-08-22] — Creación del Sistema Documental y Definición Arquitectónica
* **Autor:** Agente Antigravity / Pair Programming
* **Acciones Realizadas:**
  * Análisis de 6,858 líneas de requerimientos de cole.txt.
  * Generación de 116 archivos modulares organizados en [docs/](./docs/README.md).
  * Redacción y formalización del [Contrato de Arquitectura](./docs/CONTRATO_DE_ARQUITECTURA.md) y [AGENTS.md](./AGENTS.md).
  * Creación de la [Guía Maestra de Construcción](./GUIA_DE_CONSTRUCCION.md).
  * Creación de este tablero de control y estado vivo [contexto.md](./contexto.md).
