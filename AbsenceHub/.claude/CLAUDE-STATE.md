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
- [x] `application-dev.yml` — H2 en memoria (`jdbc:h2:mem:absencehub_dev;MODE=PostgreSQL`), consola H2 en `/h2-console`, `show-sql: true`, logs DEBUG
- [x] `pom.xml` ajustes de compatibilidad:
  - springdoc `2.8.3 → 2.6.0` (2.8.x incompatible con Spring Boot 3.3.4 — `LiteWebJarsResourceResolver`)
  - H2 scope `test → runtime` (necesario para perfil dev)
  - `java.version` se mantiene en `21` (Java 25 incompatible con Maven 3.9)
- [x] Backend arrancado correctamente con perfil `dev` y H2 en memoria
- [x] Swagger UI verificado en `http://localhost:8080/swagger-ui.html`

### 🚧 En progreso

- nada actualmente

### ❌ Pendiente

- [ ] Tests unitarios — `AuthServiceImplTest`, `TeamServiceImplTest`, `UserServiceImplTest`
- [ ] Spring Data Auditing (`@CreatedDate`) — ahora `createdAt` se fija manualmente en el servicio
- [ ] Script SQL de migración (Flyway o Liquibase) — ahora usa `ddl-auto: update` (suficiente para dev)
- [ ] Variables de entorno de producción documentadas (`JWT_SECRET`, `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASS`)

---

## Frontend — `AbsenceHub/src/`

### ✅ Completado (previo al backend)

- [x] Todos los componentes y rutas (`/login`, `/dashboard`, `/calendar`, `/requests`, `/requests/new`, `/team`, `/manager`, `/reports`)
- [x] Guards — `authGuard`, `managerGuard`
- [x] Servicios mock — `AuthService`, `AbsenceService`, `TeamService`, `ExportService`, `LangService`
- [x] i18n — ES/EN completo
- [x] Exportación PDF/Excel
- [x] PrimeNG v20 + tema violet

### 🚧 Pendiente — integración con backend real

- [ ] Interceptor HTTP con JWT — `provideHttpClient()` registrado pero sin interceptor
- [ ] `AuthService` — migrar a `POST /api/v1/auth/login` (ahora en memoria)
- [ ] `AbsenceService` — migrar a `GET/POST/PATCH /api/v1/absences` (ahora en memoria)
- [ ] `TeamService` — migrar a `GET/POST /api/v1/teams` (ahora en memoria)
- [ ] Modelo `AbsenceRequest` — ajustar `days → totalDays`, `userId/userName → user: {id, name, email, role}`, `id: string → number`
- [ ] Modelo `User` — ajustar `id: string → number`
- [ ] `manager.ts` + `manager.html` — añadir campo `managerComment` obligatorio al rechazar
- [ ] `new-request.ts` — `calculatedDays` cuenta días naturales; el backend cuenta laborables (excluye fines de semana) — alinear lógica de preview

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
