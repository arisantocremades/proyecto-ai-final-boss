# AbsenceHub — CLAUDE.md (Agente Principal)

## Rol de este archivo

Este es el punto de entrada del agente. No contiene detalles técnicos de implementación —
para eso existen `CLAUDE-FRONTEND.md`, `CLAUDE-BACKEND.md` y `CLAUDE-BBDD.md`. Este archivo define:

- cómo detectar el tipo de tarea
- qué contexto cargar
- qué convenciones son globales
- cómo coordinar integración frontend/backend

---

## Proyecto

**AbsenceHub** — aplicación empresarial de gestión de ausencias y vacaciones.

| Dimensión | Valor |
|-----------|-------|
| Dominio | RRHH / Gestión de ausencias |
| Roles | Employee, Manager, Admin |
| Frontend | Angular 21 + Signals + PrimeNG v20 |
| Backend | Spring Boot 3 + JWT + PostgreSQL |
| Idiomas UI | Español (defecto), Inglés |

---

## Router de contexto

Antes de responder cualquier tarea, clasificar:

### Tarea frontend pura → cargar `CLAUDE-FRONTEND.md`

Señales: componente Angular, signal, PrimeNG, SCSS, template HTML, test Jest,
guard, pipe, servicio Angular, routing, i18n.

Ejemplos:
- "Crea el componente de calendario"
- "El p-select no muestra las opciones traducidas"
- "Añade un test para AbsenceService"
- "El guard de manager no está bloqueando bien"

### Tarea backend pura → cargar `CLAUDE-BACKEND.md`

Señales: endpoint REST, Spring Boot, JWT, JPA, DTO, entidad, repositorio,
mapper, Spring Security, Maven, test JUnit.

Ejemplos:
- "Crea el endpoint POST /absences"
- "El JWT no está validando el rol correctamente"
- "Escribe el AbsenceServiceImpl con la validación de días"
- "Configura el GlobalExceptionHandler"

### Tarea de base de datos → cargar `CLAUDE-BBDD.md`

Señales: esquema de base de datos, migraciones, SQL, tablas, índices,
Flyway, Liquibase, queries, PostgreSQL, rendimiento de consultas.

Ejemplos:
- "Crea la migración para la tabla de ausencias"
- "Añade un índice para mejorar las búsquedas por usuario"
- "Diseña el esquema de la base de datos"
- "Crea el script SQL inicial"

### Tarea de integración → cargar AMBOS (o los tres si implica BD)

Señales: menciona Angular Y Spring juntos, HTTP interceptor, CORS, contrato API,
forma del DTO, serialización, autenticación end-to-end.

Ejemplos:
- "El frontend recibe 401 al hacer login"
- "Los campos del DTO no coinciden con lo que espera Angular"
- "Cómo conectar AbsenceService Angular con el endpoint real"
- "El CORS está bloqueando las peticiones desde localhost:4200"
- "Qué shape debe tener AuthResponse para que funcione con el localStorage"

### Tarea de arquitectura / diseño → usar criterio propio + ambos contextos

Señales: "cómo estructurar", "qué patrón usar", "diseña la arquitectura de".

---

## Convenciones globales (aplican a TODO el proyecto)

### Naming consistente cross-stack

| Concepto | Angular (frontend) | Spring (backend) |
|----------|-------------------|-----------------|
| Rol empleado | `'employee'` / `Role.EMPLOYEE` | `Role.EMPLOYEE` |
| Rol manager | `'manager'` / `Role.MANAGER` | `Role.MANAGER` |
| Rol admin | `'admin'` / `Role.ADMIN` | `Role.ADMIN` |
| Estado pendiente | `'pending'` | `AbsenceStatus.PENDING` |
| Estado aprobado | `'approved'` | `AbsenceStatus.APPROVED` |
| Estado rechazado | `'rejected'` | `AbsenceStatus.REJECTED` |
| Días vacaciones | `22` (hardcoded en AbsenceService) | `availableDays = 22` (default BD) |
| Clave sesión | `localStorage['absencehub_session']` | payload JWT |
| Formato fechas | strings ISO-8601 | `LocalDate` / ISO-8601 JSON |
| IDs | `number` (TypeScript) | `Long` (Java) |

### Reglas de negocio compartidas

1. **22 días de vacaciones por año** — frontend y backend deben coincidir.
2. **Solo Manager del propio equipo** puede aprobar/rechazar ausencias de sus miembros.
3. **Admin puede ver todo** pero también puede no tener equipo asignado — estado válido.
4. **Rechazo requiere comentario obligatorio** — validado en backend, mostrado en frontend.
5. **No solapamiento de ausencias** — validado en backend.
6. **Días laborables, no naturales** — el cálculo de `totalDays` excluye fines de semana.

### Errores — contrato compartido

El frontend intercepta errores con esta forma. El backend SIEMPRE debe responder así:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "startDate: must not be null"
}
```

Nunca romper este contrato. Si se añade información extra al error, añadir campos opcionales,
no cambiar los existentes.

---

## Reglas permanentes del agente

1. **El frontend es la fuente de verdad.** Cuando hay ambigüedad sobre un contrato, el
   comportamiento actual del frontend define qué debe hacer el backend.

2. **Detectar incompatibilidades antes de proponer código.** Si la tarea implica un contrato
   API, verificar que el DTO propuesto sea compatible con el servicio Angular correspondiente.

3. **Nunca asumir shapes sin confirmarlos.** Si no está claro qué devuelve un endpoint,
   indicarlo y proponer el shape basándose en el servicio Angular que lo consumirá.

4. **Simetría de patrones.** El agente backend sigue los mismos principios que el frontend:
   - Un concepto por clase/método (igual que un concepto por test en Jest)
   - Sin lógica en controllers (igual que sin lógica en templates Angular)
   - Interfaces → implementaciones (igual que services → componentes en Angular)

5. **Commits convencionales.** Usar siempre el formato de la skill `conventional-commits`.

6. **Pensar en integración, no en aislamiento.** Cada decisión backend debe evaluarse
   preguntando: ¿esto funciona con el Angular existente?

---

## Estructura de archivos del agente

```
.claude/
├── CLAUDE.md                          ← este archivo (router/orquestador)
├── CLAUDE-FRONTEND.md                 ← contexto frontend completo
├── CLAUDE-BACKEND.md                  ← contexto backend completo
├── CLAUDE-BBDD.md                     ← contexto base de datos completo
└── skills/
    ├── frontend/
    │   ├── angular/                   ← Angular 21 + Signals + patterns
    │   │   └── SKILL.md
    │   ├── conventional-commits/      ← formato de commits
    │   │   └── SKILL.md
    │   ├── jest-unit-testing/         ← tests unitarios Jest
    │   │   └── SKILL.md
    │   ├── primeng/                   ← PrimeNG v20 components
    │   │   └── SKILL.md
    │   └── scss/                      ← SCSS + variables CSS del tema
    │       └── SKILL.md
    └── backend/
        └── spring-boot/               ← Spring Boot 3 + REST + JPA + JWT
            └── SKILL-spring-boot.md
```

---

## Cómo responder tareas de integración

Cuando la tarea es de integración (frontend ↔ backend):

1. **Mostrar ambos lados** — el código Angular que consume y el endpoint/DTO que provee.
2. **Verificar el contrato** — confirmar que los campos, tipos y nombres coinciden.
3. **Señalar divergencias** — si algo no cuadra, indicarlo explícitamente antes de proponer
   la solución.
4. **No hacer suposiciones silenciosas** — si algo está indefinido, decirlo.

Ejemplo de respuesta bien estructurada para tarea de integración:

```
## Contrato verificado

Angular espera (AbsenceService):
  { id: number, type: string, status: string, startDate: string, ... }

Backend propone (AbsenceResponse):
  { id: Long, type: AbsenceType, status: AbsenceStatus, startDate: LocalDate, ... }

Serialización: ✅ compatible (Jackson → ISO strings, enums como STRING)
Incompatibilidades detectadas: ninguna

## Implementación
[código]
```
