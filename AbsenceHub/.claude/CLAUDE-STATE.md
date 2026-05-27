# AbsenceHub — CLAUDE-STATE.md (Memoria del agente)

> Este archivo es la memoria persistente del agente.
> Se actualiza después de cada tarea completada.
> NO contiene convenciones ni arquitectura — eso está en CLAUDE.md, CLAUDE-FRONTEND.md y CLAUDE-BACKEND.md.
> En caso de conflicto de merge, prevalece la versión más reciente.

---

## Backend — `absencehub-api/`

### ✅ Completado

- [x] Estructura Maven + `pom.xml` (Spring Boot 3, JWT, MapStruct, Lombok, PostgreSQL, H2, SpringDoc)
- [x] `application.yml` + `application-test.yml` (H2 en memoria para tests)
- [x] Entidades JPA — `User`, `Team`, `AbsenceRequest`
- [x] Enums — `Role`, `AbsenceType`, `AbsenceStatus` — serializados en **lowercase** con `@JsonValue` (`'pending'`, `'vacation'`, `'sick'` — NO `SICK_LEAVE`) para coincidir con el frontend
- [x] DTOs — 11 request records + 8 response records
- [x] Repositorios — `UserRepository`, `TeamRepository`, `AbsenceRequestRepository` con queries JPQL custom
- [x] Seguridad — `JwtUtil`, `JwtAuthFilter`, `UserDetailsImpl`, `UserDetailsServiceImpl`
- [x] `SecurityConfig` — CORS para `localhost:4200`, permisos por rol
- [x] Mappers MapStruct — `UserMapper`, `AbsenceMapper`, `TeamMapper`
- [x] Servicios — 5 interfaces + 5 implementaciones (`Auth`, `Absence`, `User`, `Team`, `Report`)
- [x] Controllers REST — `AuthController`, `AbsenceController`, `UserController`, `TeamController`, `ReportController`
- [x] `GlobalExceptionHandler` — shape `{ code, message }` compatible con Angular
- [x] `DataInitializer` — seeds para entorno dev (usuarios mock equivalentes al frontend)
- [x] `OpenApiConfig` — Swagger UI en `/swagger-ui.html`
- [x] Tests — `AbsenceServiceImplTest`, `AbsenceControllerTest`
- [x] `application-dev.yml` — H2 en memoria (`jdbc:h2:mem:absencehub_dev;MODE=PostgreSQL`), consola H2 en `/h2-console`, `show-sql: true`, logs DEBUG; `spring.jpa.defer-datasource-initialization: true` (data.sql se ejecuta DESPUÉS de que Hibernate cree las tablas — sin esto el backend no arranca); `spring.sql.init.encoding: UTF-8` + `mode: always` (tildes en datos de ejemplo)
- [x] `pom.xml` ajustes de compatibilidad:
  - springdoc `2.8.3 → 2.6.0` (2.8.x incompatible con Spring Boot 3.3.4 — `LiteWebJarsResourceResolver`)
  - H2 scope `test → runtime` (necesario para perfil dev)
  - `java.version` se mantiene en `21` (Java 25 incompatible con Maven 3.9)
- [x] Backend arrancado correctamente con perfil `dev` y H2 en memoria
- [x] Swagger UI verificado en `http://localhost:8080/swagger-ui.html`
- [x] `data.sql` — script de datos de ejemplo para PostgreSQL (prod/staging); 6 usuarios con hashes BCrypt $2b$10$, 1 equipo, 9 ausencias; equivalente exacto a `DataInitializer.java`

### 🚧 En progreso

- nada actualmente

### ❌ Pendiente

- [ ] Tests unitarios — `AuthServiceImplTest`, `TeamServiceImplTest`, `UserServiceImplTest`
- [ ] Spring Data Auditing (`@CreatedDate`) — ahora `createdAt` se fija manualmente en el servicio
- [ ] Script SQL de migración (Flyway o Liquibase) — ahora usa `ddl-auto: update` (suficiente para dev)
- [ ] Variables de entorno de producción documentadas (`JWT_SECRET`, `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASS`)

---

## Frontend — `AbsenceHub/src/`

### ✅ Completado (base de componentes)

- [x] Todos los componentes y rutas (`/login`, `/dashboard`, `/calendar`, `/requests`, `/requests/new`, `/team`, `/manager`, `/reports`)
- [x] Guards — `authGuard`, `managerGuard`
- [x] Servicios — `TeamService`, `ExportService`, `LangService` (mock)
- [x] i18n — ES/EN completo + claves nuevas para diálogo de rechazo (`manager.rejectTitle`, `rejectCommentLabel`, `rejectCommentPlaceholder`, `rejectConfirm`, `rejectCancel`)
- [x] Exportación PDF/Excel
- [x] PrimeNG v20 + tema violet

### ✅ Completado — integración con backend real

- [x] `src/environments/environment.ts` — `apiUrl: 'http://localhost:8080/api/v1'`
- [x] `src/app/shared/interceptors/auth.interceptor.ts` — `HttpInterceptorFn` que inyecta `Authorization: Bearer <token>` en cada petición; token leído de `localStorage['absencehub_token']`
- [x] `app.config.ts` — `provideHttpClient(withInterceptors([authInterceptor]))` activo
- [x] `AuthService` — migrado a `POST /api/v1/auth/login`; token guardado en `localStorage['absencehub_token']`; sesión de usuario en `localStorage['absencehub_session']`; `login()` devuelve `Observable<boolean>`; `refreshCurrentUser()` disponible vía `GET /api/v1/auth/me`
- [x] `AbsenceService` — migrado a HttpClient; sin mocks; métodos: `loadMyAbsences()` (`GET /absences`), `loadTeamAbsences()` (`GET /absences/team`), `createRequest()` (`POST /absences`), `approve()` (`PATCH /{id}/approve`), `reject()` (`PATCH /{id}/reject {managerComment}`); todos devuelven `Observable<>`; pipe usa `map(list => list.map(mapApiAbsence))` + `tap(mapped => this._requests.set(mapped))` — el cast `as Observable<AbsenceRequest[]>` fue reemplazado por `map()` correcto; `map` añadido a imports de rxjs junto a `tap`
- [x] `mapApiAbsence()` — resuelve las 4 incompatibilidades de DTO: `id: number → string`, `user.id/name → userId/userName` (flatten), `totalDays → days`, `createdAt datetime → date` (`split('T')[0]`)
- [x] `mapApiUser()` — `id: number → string`
- [x] `Dashboard` — implementa `OnInit`, llama `loadMyAbsences()`; `getAvailableDays()` corregido (ya no pasa `role` como segundo arg)
- [x] `Requests` — implementa `OnInit`, llama `loadMyAbsences()`
- [x] `NewRequest` — implementa `OnInit`, llama `loadMyAbsences()` (para detección de conflictos); `createRequest()` usa payload `{type, startDate, endDate, reason}` y `.subscribe()`; signal `submitting` evita doble envío; `getAvailableDays()` corregido
- [x] `Manager` — implementa `OnInit`, llama `loadTeamAbsences()`; `approve()` con `.subscribe()`; `reject()` abre diálogo con `rejectDialogVisible` / `rejectComment` / `selectedRejectId` signals; `confirmReject()` llama `absence.reject(id, comment).subscribe()`; imports añadidos: `FormsModule`, `DialogModule`, `TextareaModule`

### ✅ Completado — notificaciones y mejoras de UX

- [x] `Calendar` — implementa `OnInit`, llama `loadTeamAbsences()` en `ngOnInit()`; el calendario ahora carga ausencias reales del equipo desde el backend
- [x] `NotificationType` — nuevo valor `RequestSent = 'sent'` para notificar al empleado cuando envía una solicitud
- [x] `NewRequest` — al crear solicitud exitosamente, genera notificación `RequestSent` para el empleado (vía `NotificationService.push()`)
- [x] `Manager` — sistema de notificaciones completo:
  - Al cargar (`ngOnInit`): genera notificación `RequestSubmitted` para el manager por cada solicitud pendiente nueva (deduplicada por `requestId`)
  - `approve()`: genera notificación `RequestApproved` para el empleado afectado
  - `confirmReject()`: genera notificación `RequestRejected` para el empleado afectado
  - Usa `RequestStatus.Pending` (enum) en lugar de string literal `'pending'`
- [x] `TeamService.changeMemberRole()` — migrado a `PATCH /api/v1/users/{id}/role`; devuelve `Observable<void>`; actualiza el signal local en `tap()` (solo si la API responde OK); inyecta `HttpClient`
- [x] `Team (team.ts / team.html)` — `changeRole()` usa `.subscribe()` con manejo de error; la columna de rol muestra tags readonly (`p-tag`) en lugar del `<select>` editable; la condición de "es manager" usa `member.role === UserRole.Manager` (antes era `member.id === userId()`)
- [x] Layout sidebar — navegación condicional por rol: Admin solo ve "Gestión de equipos" (`/team`); Employee/Manager ven el menú completo (dashboard, calendar, requests, policy, team; manager también ve panel manager y reports)
- [x] i18n (ES + EN) — nuevas claves: `login.hintAdmin`, `notifications.sentTitle`, `notifications.sentBody`
- [x] Diálogo de reasignación de manager (`team.html`) — ancho aumentado a `560px`, añadido filtro de búsqueda (`filter` + `filterBy="name"`) en el select

### 🚧 Pendiente

- [ ] `TeamService` — `changeMemberRole()` ya usa el backend; pero la carga inicial de miembros y equipos sigue siendo mock — migrar a `GET /api/v1/teams` y `GET /api/v1/users`
- [ ] `new-request.ts` — `calculatedDays` cuenta días naturales; el backend cuenta laborables (excluye fines de semana) — discrepancia en el preview de duración antes de enviar
- [ ] Tests unitarios — actualizar specs de `AuthService`, `AbsenceService`, `Manager`, `NewRequest`, `Dashboard` y `Requests` (ahora requieren `HttpClientTestingModule` y proveedores de entorno)

---

## Arquitectura de datos — Frontend ↔ Backend

### Flujo HTTP

```
Componente
  → ngOnInit() llama service.loadXxx().subscribe()
  → AbsenceService / AuthService (HttpClient)
  → authInterceptor añade Bearer token desde localStorage
  → Spring Boot REST API (localhost:8080/api/v1)
  → tap() actualiza signal _requests / _sessionUser
  → computed() se recalcula automáticamente
  → Template re-renderiza vía Change Detection
```

### Almacenamiento de sesión (localStorage)

| Clave | Contenido | Ciclo de vida |
|-------|-----------|---------------|
| `absencehub_token` | JWT Bearer (string) | Login → Logout |
| `absencehub_session` | `User` serializado como JSON | Login → Logout; se restaura al cargar la app |

### Mapeo de DTOs — Backend → Frontend

| Campo backend (`ApiAbsenceResponse`) | Campo frontend (`AbsenceRequest`) | Transformación |
|--------------------------------------|-----------------------------------|----------------|
| `id: number` | `id: string` | `.toString()` |
| `user.id: number` | `userId: string` | `api.user.id.toString()` |
| `user.name: string` | `userName: string` | `api.user.name` (flatten) |
| `totalDays: number` | `days: number` | rename |
| `createdAt: 'YYYY-MM-DDTHH:mm:ss'` | `createdAt: 'YYYY-MM-DD'` | `.split('T')[0]` |
| `type: string` | `type: AbsenceType` | cast |
| `status: string` | `status: RequestStatus` | cast |

### Endpoints consumidos por el frontend

| Método | URL | Servicio Angular | Llamado desde |
|--------|-----|-----------------|---------------|
| `POST` | `/auth/login` | `AuthService.login()` | `Login.onSubmit()` |
| `GET` | `/auth/me` | `AuthService.refreshCurrentUser()` | (disponible, no usado aún) |
| `GET` | `/absences` | `AbsenceService.loadMyAbsences()` | `Dashboard`, `Requests`, `NewRequest` (ngOnInit) |
| `GET` | `/absences/team` | `AbsenceService.loadTeamAbsences()` | `Manager`, `Calendar` (ngOnInit) |
| `POST` | `/absences` | `AbsenceService.createRequest()` | `NewRequest.onSubmit()` |
| `PATCH` | `/absences/{id}/approve` | `AbsenceService.approve()` | `Manager.approve()` |
| `PATCH` | `/absences/{id}/reject` | `AbsenceService.reject()` | `Manager.confirmReject()` |
| `PATCH` | `/users/{id}/role` | `TeamService.changeMemberRole()` | `MyTeam.changeRole()` |

---

## Infraestructura

### ✅ Completado

- [x] Entorno local configurado:
  - **Java:** 21 (Eclipse Adoptium) en `C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`
  - **Maven:** 3.9.16 en `C:\desarrollo\maven\apache-maven-3.9.16`
- [x] Backend arrancado en perfil `dev` con H2 en memoria (puerto 8080)
- [x] Swagger UI verificado en `http://localhost:8080/swagger-ui.html`

### Comandos de arranque

Configurar PATH antes de cada sesión (PowerShell):
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
```

Arrancar backend (dev — H2 en memoria, sin PostgreSQL):
```
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Arrancar backend (prod — requiere PostgreSQL con base de datos `absencehub`):
```
mvn spring-boot:run "-Dspring-boot.run.profiles=prod"
```

### ❌ Pendiente

- [ ] PostgreSQL — configurar base de datos local o Docker (`absencehub` database) para perfil prod

---

## Log de sesiones

| Fecha | Qué se hizo |
|-------|------------|
| 2026-05-26 | Análisis completo del frontend (servicios, modelos, guards, rutas). Generado backend completo (61 archivos): enums, entidades, DTOs, repos, seguridad JWT, mappers MapStruct, 5 servicios con reglas de negocio, 5 controllers, 2 tests. Decisión clave: enums serializados en lowercase (`'sick'` no `'SICK_LEAVE'`). Identificados 5 ajustes pendientes en Angular para integración. |
| 2026-05-26 | Verificación de enums backend vs frontend. Código real ✅ correcto (`@JsonValue` lowercase en `AbsenceStatus`, `AbsenceType`, `Role`; `JwtUtil` usa `.getValue()` → lowercase). Corregidos 6 errores en `CLAUDE-BACKEND.md`: sección enums sin `@JsonValue`, `SICK_LEAVE` → `SICK`, nota falsa "frontend espera UPPERCASE", test `"PENDING"` → `"pending"`, JWT payload `"MANAGER"` → `"manager"`, tabla incompatibilidades invertida. |
| 2026-05-27 | Creado `application-dev.yml` (H2 en memoria, consola H2, show-sql). Ajustes `pom.xml`: springdoc `2.8.3→2.6.0` (incompatible con SB 3.3.4), H2 scope `test→runtime`, `java.version` queda en 21 (Java 25 incompatible con Maven 3.9). Backend arrancado correctamente con perfil dev. Swagger UI verificado. Entorno local documentado (Java 21 Adoptium + Maven 3.9.16). |
| 2026-05-27 | Arreglos post-integración. `application-dev.yml`: añadido `defer-datasource-initialization: true` (el backend no arrancaba — data.sql se ejecutaba antes de que Hibernate creara las tablas) + `sql.init.encoding: UTF-8` + `mode: always`. `AbsenceService`: corregido cast incorrecto `as Observable<AbsenceRequest[]>` en `loadMyAbsences()` y `loadTeamAbsences()` → sustituido por `map(list => list.map(mapApiAbsence))` seguido de `tap()`; `map` añadido a imports rxjs. Integración verificada: `POST /api/v1/auth/login` devuelve 200, flujo front-back funciona correctamente. |
| 2026-05-27 | Integración frontend-backend completada. Eliminados todos los mocks de `AuthService` y `AbsenceService`. Creados: `environment.ts` (apiUrl), `auth.interceptor.ts` (JWT Bearer). `AuthService` migrado a `POST /auth/login` con `Observable<boolean>`. `AbsenceService` migrado a HttpClient con `loadMyAbsences()`, `loadTeamAbsences()`, todos los métodos devuelven `Observable`. `mapApiAbsence()` resuelve 4 incompatibilidades de DTO (id, userId/userName, totalDays→days, datetime→date). Dashboard, Requests, NewRequest, Manager implementan `OnInit` y cargan datos del backend. Manager añade diálogo de rechazo con `managerComment` obligatorio (3 signals + `confirmReject()`). Nuevas claves i18n ES/EN para el diálogo. Creado `data.sql` para PostgreSQL con 6 usuarios (BCrypt), 1 equipo, 9 ausencias. README actualizado con instrucciones de arranque full-stack. |
| 2026-05-27 | Mejoras en calendario, equipos, solicitudes y seguridad. `Calendar` implementa `OnInit` y carga ausencias del equipo. Sistema de notificaciones completado: nuevo `NotificationType.RequestSent`; `NewRequest` genera notif al empleado al enviar; `Manager` genera notifs al cargar pendientes, al aprobar y al rechazar (deduplicadas). `TeamService.changeMemberRole()` migrado a `PATCH /users/{id}/role` con `Observable<void>`. `Team` usa tags readonly en lugar del select de rol. Sidebar condicional por rol: Admin solo ve /team; Manager/Employee ven menú completo. Nuevas claves i18n: `login.hintAdmin`, `notifications.sentTitle/Body`. Diálogo reasignación manager ampliado (560px) con filtro de búsqueda. |
