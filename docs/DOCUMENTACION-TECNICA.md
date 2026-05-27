# Documentación Técnica — AbsenceHub

> **Versión:** 0.0.1-SNAPSHOT
> **Última actualización:** 2026-05-27
> **Estado:** Beta

---

## 1. Visión general

AbsenceHub es una aplicación empresarial de gestión de ausencias y vacaciones orientada a equipos de trabajo. Permite a empleados solicitar cualquier tipo de ausencia (vacaciones, baja médica, personal u otras), a managers revisar y aprobar o rechazar las solicitudes de su equipo, y a administradores gestionar la estructura organizativa completa.

El sistema está compuesto por dos artefactos independientes: un frontend SPA desarrollado en Angular 21 con Signals y un backend REST API desarrollado en Spring Boot 3.3.4 con autenticación JWT y persistencia en PostgreSQL. Ambos se comunican exclusivamente a través de la API REST bajo el prefijo `/api/v1`.

La aplicación es multiidioma (español e inglés), incluye exportación de informes a PDF y Excel, y un calendario interactivo que muestra las ausencias del equipo con cálculo de días hábiles excluyendo fines de semana y festivos españoles.

---

## 2. Stack tecnológico

### Frontend

| Categoría | Tecnología | Versión |
|---|---|---|
| Lenguaje | TypeScript | ~5.9.2 |
| Framework | Angular (Standalone + Signals) | ^21.2.0 |
| Componentes UI | PrimeNG + @primeuix/themes (tema Aura, color violet) | ^21.0.0 / ^1.2.5 |
| Iconos | PrimeIcons | ^7.0.0 |
| Internacionalización | @ngx-translate/core + @ngx-translate/http-loader | ^17.0.0 |
| Exportación PDF | jsPDF + jspdf-autotable | ^4.2.1 / ^5.0.8 |
| Exportación Excel | xlsx | ^0.18.5 |
| Testing | Jest + jest-preset-angular | ^30.4.2 / ^16.1.5 |
| Build / Bundler | Angular Build (@angular/build) | ^21.2.12 |

### Backend

| Categoría | Tecnología | Versión |
|---|---|---|
| Lenguaje | Java | 21 |
| Framework | Spring Boot (Web, JPA, Security, Validation) | 3.3.4 |
| Base de datos (producción) | PostgreSQL | - |
| Base de datos (desarrollo/test) | H2 (modo PostgreSQL) | - |
| ORM | Spring Data JPA + Hibernate | incluido en Spring Boot |
| Mapeo de DTOs | MapStruct | 1.6.3 |
| Reducción de boilerplate | Lombok | incluido en Spring Boot |
| Autenticación | JWT — jjwt (HS256) | 0.12.6 |
| Documentación API | SpringDoc OpenAPI 3 / Swagger UI | 2.6.0 |
| Testing | JUnit 5 + Mockito + spring-security-test | incluido en Spring Boot |

---

## 3. Arquitectura

AbsenceHub sigue una arquitectura cliente-servidor con separación estricta entre frontend y backend.

```
┌─────────────────────────────────────────────────────────┐
│               FRONTEND — Angular 21 SPA                 │
│  Components (Signals) → Services → HTTP + Interceptor   │
│              Puerto 4200 | localhost                     │
└─────────────────────────┬───────────────────────────────┘
                          │ REST (JSON) + Bearer JWT
                          │ CORS habilitado para :4200
┌─────────────────────────▼───────────────────────────────┐
│               BACKEND — Spring Boot 3                   │
│  Controller → Service (Interface/Impl) → Repository     │
│  JwtAuthFilter → SecurityFilterChain (STATELESS)        │
│              Puerto 8080 | localhost                     │
└─────────────────────────┬───────────────────────────────┘
                          │ JPA (Hibernate)
┌─────────────────────────▼───────────────────────────────┐
│               BASE DE DATOS — PostgreSQL                │
│  Tablas: users, teams, absence_requests                 │
│  DDL auto: update (Hibernate genera el esquema)         │
└─────────────────────────────────────────────────────────┘
```

**Patrones detectados:**

- **Frontend:** Standalone Components, Signals (signal/computed/effect), Functional Guards, HTTP Interceptors funcionales, Lazy Loading de rutas, Reactive Forms
- **Backend:** MVC (Controller/Service/Repository), Patrón Repository (Spring Data JPA), DTOs con Records Java, MapStruct para mapeo Entity↔DTO, Interface+Impl para servicios, STATELESS session (JWT), `@EnableMethodSecurity` para autorización a nivel de método

---

## 4. Estructura del proyecto

```
proyecto-ai-final-boss/
├── AbsenceHub/                         # Frontend Angular
│   ├── .claude/                        # Contexto del agente de IA
│   │   ├── CLAUDE.md                   # Router de contexto
│   │   ├── CLAUDE-FRONTEND.md
│   │   ├── CLAUDE-BACKEND.md
│   │   ├── CLAUDE-BBDD.md
│   │   └── skills/                     # Skills especializadas
│   ├── public/
│   │   ├── i18n/                       # Traducciones JSON
│   │   │   ├── es-ES.json
│   │   │   └── en-US.json
│   │   └── absencehub_logo_tech.svg
│   ├── src/
│   │   ├── main.ts                     # Entry point Angular
│   │   ├── styles.scss                 # Estilos globales
│   │   ├── environments/
│   │   │   └── environment.ts          # apiUrl: http://localhost:8080/api/v1
│   │   └── app/
│   │       ├── app.ts / app.routes.ts  # Root component + rutas
│   │       ├── app.config.ts           # Providers globales
│   │       ├── auth/                   # Módulo de autenticación
│   │       │   ├── login/              # Componente login
│   │       │   ├── services/           # AuthService
│   │       │   ├── guards/             # authGuard, managerGuard
│   │       │   └── models/             # user.model.ts
│   │       ├── layout/                 # Shell (sidebar + router-outlet)
│   │       ├── dashboard/              # Página inicio autenticado
│   │       ├── calendar/               # Calendario mensual visual
│   │       ├── requests/               # Mis solicitudes
│   │       │   └── new-request/        # Formulario nueva solicitud
│   │       ├── manager/                # Panel de revisión (Manager)
│   │       ├── team/                   # Gestión de equipos
│   │       ├── policy/                 # Política de ausencias (lectura)
│   │       ├── reports/                # Informes con exportación
│   │       └── shared/
│   │           ├── models/             # absence, notification, policy, team
│   │           ├── services/           # AbsenceService, NotificationService,
│   │           │                       # TeamService, LangService, ExportService
│   │           ├── interceptors/       # authInterceptor (Bearer JWT)
│   │           ├── components/         # notification-bell
│   │           └── utils/              # working-days.ts (días hábiles)
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.ts
│
├── absencehub-api/                     # Backend Spring Boot
│   ├── src/main/java/com/absencehub/api/
│   │   ├── AbsenceHubApplication.java  # Entry point Spring Boot
│   │   ├── config/
│   │   │   ├── SecurityConfig.java     # CORS, JWT filter, autorización
│   │   │   ├── DataInitializer.java    # Seed datos (perfil dev)
│   │   │   └── OpenApiConfig.java      # Swagger config
│   │   ├── controller/                 # AuthController, AbsenceController,
│   │   │                               # TeamController, UserController,
│   │   │                               # ReportController
│   │   ├── service/                    # Interfaces de servicio
│   │   │   └── impl/                   # Implementaciones
│   │   ├── repository/                 # JPA Repositories con JPQL custom
│   │   ├── entity/                     # User, Team, AbsenceRequest
│   │   ├── dto/
│   │   │   ├── request/                # DTOs de entrada (Records Java)
│   │   │   └── response/               # DTOs de salida (Records Java)
│   │   ├── enums/                      # Role, AbsenceType, AbsenceStatus
│   │   ├── mapper/                     # MapStruct: AbsenceMapper, TeamMapper,
│   │   │                               # UserMapper
│   │   ├── security/                   # JwtUtil, JwtAuthFilter,
│   │   │                               # UserDetailsImpl, UserDetailsServiceImpl
│   │   └── exception/                  # GlobalExceptionHandler, BusinessException,
│   │                                   # ResourceNotFoundException, AppException
│   ├── src/main/resources/
│   │   ├── application.yml             # Configuración base (PostgreSQL)
│   │   └── application-dev.yml         # Perfil dev (H2 + Swagger)
│   ├── src/test/                       # Tests JUnit 5
│   └── pom.xml
│
├── docs/                               # Documentación generada
│   ├── DOCUMENTACION-TECNICA.md
│   └── DOCUMENTACION-COMERCIAL.md
└── README.md                           # Instrucciones de arranque
```

---

## 5. Modelos de datos

### User

| Campo | Tipo SQL | Tipo Java | Descripción |
|---|---|---|---|
| id | BIGSERIAL PK | Long | Identificador autoincremental |
| email | VARCHAR UNIQUE NOT NULL | String | Email de acceso (único) |
| password | VARCHAR NOT NULL | String | Hash BCrypt |
| name | VARCHAR NOT NULL | String | Nombre completo |
| role | VARCHAR NOT NULL | Role (enum) | EMPLOYEE, MANAGER o ADMIN |
| team_id | BIGINT FK → teams | Team (lazy) | Equipo asignado (nullable) |
| available_days | INTEGER DEFAULT 22 | Integer | Días de vacaciones anuales disponibles |
| is_active | BOOLEAN DEFAULT true | Boolean | Baja lógica de usuario |

### Team

| Campo | Tipo SQL | Tipo Java | Descripción |
|---|---|---|---|
| id | BIGSERIAL PK | Long | Identificador autoincremental |
| name | VARCHAR UNIQUE NOT NULL | String | Nombre del equipo (único) |
| description | VARCHAR(500) | String | Descripción (nullable) |
| manager_id | BIGINT FK → users | User (lazy, OneToOne) | Manager asignado (nullable) |
| members | — | List\<User\> (OneToMany) | Usuarios del equipo (mappedBy team) |

### AbsenceRequest

| Campo | Tipo SQL | Tipo Java | Descripción |
|---|---|---|---|
| id | BIGSERIAL PK | Long | Identificador autoincremental |
| user_id | BIGINT FK → users NOT NULL | User (lazy) | Empleado solicitante |
| type | VARCHAR NOT NULL | AbsenceType (enum) | VACATION, SICK, PERSONAL, OTHER |
| start_date | DATE NOT NULL | LocalDate | Fecha inicio |
| end_date | DATE NOT NULL | LocalDate | Fecha fin |
| total_days | INTEGER NOT NULL | Integer | Días laborables calculados |
| status | VARCHAR NOT NULL DEFAULT PENDING | AbsenceStatus (enum) | PENDING, APPROVED, REJECTED |
| reason | VARCHAR(500) | String | Motivo del empleado (nullable) |
| manager_comment | VARCHAR(500) | String | Comentario del revisor (nullable) |
| reviewed_by | BIGINT FK → users | User (lazy) | Manager/Admin que revisó (nullable) |
| reviewed_at | TIMESTAMP | LocalDateTime | Momento de revisión (nullable) |
| created_at | TIMESTAMP NOT NULL | LocalDateTime | Momento de creación |

**Relaciones:**
- `User` ↔ `Team`: ManyToOne (muchos empleados en un equipo)
- `Team` → `User` (manager): OneToOne (un manager por equipo)
- `AbsenceRequest` → `User`: ManyToOne (una solicitud pertenece a un empleado)
- `AbsenceRequest` → `User` (reviewedBy): ManyToOne opcional

---

## 6. API / Endpoints

### Autenticación

Bearer Token JWT enviado en el header `Authorization: Bearer <token>`. Token generado con HMAC-SHA256, vigencia de 24 horas (86.400.000 ms). El frontend lo persiste en `localStorage['absencehub_token']`.

El subject del JWT es el `userId` (Long). El token incluye los claims `email` y `role` (en minúsculas para compatibilidad con Angular).

### Auth — `/api/v1/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/login` | No | Iniciar sesión |
| POST | `/api/v1/auth/logout` | Sí | Cerrar sesión (el cliente elimina el token) |
| GET | `/api/v1/auth/me` | Sí | Obtener usuario autenticado |

#### `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "manager@absencehub.com",
  "password": "manager123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "manager@absencehub.com",
    "name": "María López",
    "role": "manager",
    "availableDays": 22,
    "team": { "id": 1, "name": "Equipo de Desarrollo" }
  }
}
```

### Ausencias — `/api/v1/absences`

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/absences` | Sí | Todos | Mis ausencias (usuario autenticado) |
| GET | `/api/v1/absences/{id}` | Sí | Propietario / Manager / Admin | Detalle de ausencia |
| GET | `/api/v1/absences/team` | Sí | MANAGER, ADMIN | Ausencias del equipo del manager |
| GET | `/api/v1/absences/all` | Sí | ADMIN | Todas las ausencias con filtros opcionales |
| POST | `/api/v1/absences` | Sí | Todos | Crear solicitud de ausencia |
| PUT | `/api/v1/absences/{id}` | Sí | Propietario (solo PENDING) | Modificar solicitud pendiente |
| DELETE | `/api/v1/absences/{id}` | Sí | Propietario (solo PENDING) | Eliminar solicitud pendiente |
| PATCH | `/api/v1/absences/{id}/approve` | Sí | MANAGER, ADMIN | Aprobar solicitud |
| PATCH | `/api/v1/absences/{id}/reject` | Sí | MANAGER, ADMIN | Rechazar solicitud (requiere comentario) |

#### `POST /api/v1/absences`

**Request:**
```json
{
  "type": "VACATION",
  "startDate": "2026-06-02",
  "endDate": "2026-06-06",
  "reason": "Vacaciones de verano"
}
```

**Response `201`:**
```json
{
  "id": 10,
  "user": { "id": 2, "name": "Carlos Martínez", "email": "empleado@absencehub.com", "role": "employee" },
  "type": "VACATION",
  "startDate": "2026-06-02",
  "endDate": "2026-06-06",
  "totalDays": 5,
  "status": "PENDING",
  "reason": "Vacaciones de verano",
  "managerComment": null,
  "reviewedBy": null,
  "reviewedAt": null,
  "createdAt": "2026-05-27T10:30:00"
}
```

#### `PATCH /api/v1/absences/{id}/reject`

**Request:**
```json
{
  "managerComment": "No hay cobertura suficiente en esas fechas"
}
```

**Response `200`:** AbsenceResponse con `status: "REJECTED"` y `managerComment` relleno.

### Equipos — `/api/v1/teams`

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/teams` | Sí | MANAGER, ADMIN | Listar equipos (Admin: todos; Manager: el suyo) |
| GET | `/api/v1/teams/{id}` | Sí | MANAGER, ADMIN | Detalle de equipo |
| POST | `/api/v1/teams` | Sí | ADMIN | Crear equipo |
| PUT | `/api/v1/teams/{id}` | Sí | ADMIN | Actualizar equipo |
| POST | `/api/v1/teams/{id}/members` | Sí | ADMIN | Añadir miembro |
| DELETE | `/api/v1/teams/{id}/members/{userId}` | Sí | ADMIN | Eliminar miembro |

### Usuarios — `/api/v1/users`

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/users/me` | Sí | Todos | Perfil del usuario autenticado |
| PUT | `/api/v1/users/me` | Sí | Todos | Actualizar perfil propio |
| GET | `/api/v1/users/search?email=` | Sí | Todos | Búsqueda de usuarios por email/nombre |
| GET | `/api/v1/users` | Sí | ADMIN | Listar todos los usuarios |
| POST | `/api/v1/users` | Sí | ADMIN | Crear usuario |
| PUT | `/api/v1/users/{id}` | Sí | ADMIN | Actualizar usuario |
| PATCH | `/api/v1/users/{id}/role` | Sí | ADMIN | Cambiar rol de usuario |

### Informes — `/api/v1/reports`

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | `/api/v1/reports/absences` | Sí | MANAGER, ADMIN | Ausencias con filtros opcionales (status, type, startDate, endDate) |
| GET | `/api/v1/reports/summary` | Sí | MANAGER, ADMIN | Estadísticas generales |

### Formato de error (contrato compartido frontend-backend)

Todos los errores responden con esta estructura:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "startDate: must not be null"
}
```

| Código HTTP | Código de error | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bean Validation fallido |
| 401 | `UNAUTHORIZED` | Token inválido o expirado |
| 403 | `FORBIDDEN` | Permisos insuficientes |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `BUSINESS_EXCEPTION` | Regla de negocio violada (overlap, días insuficientes…) |
| 500 | `INTERNAL_ERROR` | Error inesperado del servidor |

---

## 7. Flujos principales

### Flujo: Autenticación

1. El usuario accede a `/login` (ruta pública, sin authGuard).
2. Login.component envía `POST /api/v1/auth/login` con `{ email, password }`.
3. `AuthService` (Spring) valida credenciales con BCrypt, genera JWT (HS256, 24h).
4. El backend responde con `AuthResponse` (token + datos del usuario).
5. El frontend guarda el token en `localStorage['absencehub_token']` y el usuario en `localStorage['absencehub_session']`.
6. `authInterceptor` inyecta `Authorization: Bearer <token>` en todas las peticiones posteriores.
7. `JwtAuthFilter` extrae y valida el token en cada petición al backend.
8. Al hacer logout, el frontend elimina ambas entradas del localStorage. El backend no mantiene estado de sesión.

### Flujo: Crear solicitud de ausencia

1. Employee accede a `/requests/new` (protegido por `authGuard`).
2. Selecciona tipo, fechas y motivo. El frontend calcula los días hábiles (`countWorkingDays`), excluyendo fines de semana y festivos españoles.
3. Validaciones del frontend antes del envío: fechas válidas, fin ≥ inicio, no solapamiento con solicitudes existentes, días disponibles suficientes (si es vacaciones).
4. `AbsenceService.createRequest()` → `POST /api/v1/absences`.
5. El backend re-valida: rango de fechas, solapamiento en BD, días disponibles de vacaciones del año en curso.
6. Si todo es correcto, se persiste `AbsenceRequest` con `status = PENDING` y `totalDays` calculado (solo excluye fines de semana, no festivos).
7. El frontend navega a `/requests` y muestra la nueva solicitud.

### Flujo: Aprobación / Rechazo de solicitud

1. Manager accede a `/manager` (protegido por `managerGuard`).
2. La vista muestra las solicitudes con `status = PENDING` de su equipo (`GET /api/v1/absences/team`).
3. **Aprobación:** `PATCH /api/v1/absences/{id}/approve` con body opcional `{ managerComment }`. El backend verifica que el manager pertenece al mismo equipo que el empleado.
4. **Rechazo:** `PATCH /api/v1/absences/{id}/reject` con body `{ managerComment }` (comentario obligatorio). El backend aplica la misma verificación de equipo.
5. El backend actualiza `status`, `reviewedBy`, `reviewedAt` y `managerComment`.
6. El frontend actualiza la señal de solicitudes y `pendingCount()` se recalcula automáticamente.

### Flujo: Exportación de informes

1. Manager o Admin accede a `/reports`.
2. Aplica filtros opcionales: rango de fechas, tipo de ausencia, estado, usuario.
3. El frontend filtra localmente la lista cargada y muestra una vista previa.
4. Botón "Exportar PDF" → `ExportService.exportPdf()` genera documento con jsPDF (logo, cabecera, tabla, paginación) y lo descarga.
5. Botón "Exportar Excel" → `ExportService.exportExcel()` genera hoja XLSX y la descarga.

---

## 8. Configuración y despliegue

### Variables de entorno / configuración del backend

| Variable / Propiedad | Descripción | Requerida | Valor por defecto |
|---|---|---|---|
| `DATABASE_URL` | URL JDBC de PostgreSQL | Sí (prod) | `jdbc:postgresql://localhost:5432/absencehub` |
| `DATABASE_USER` | Usuario de BD | Sí (prod) | `postgres` |
| `DATABASE_PASS` | Contraseña de BD | Sí (prod) | `postgres` |
| `JWT_SECRET` | Clave secreta JWT (Base64, mínimo 256 bits) | Sí (prod) | `bXktc2VjcmV0LWtleS1mb3ItYWJzZW5jZWh1Yi1hcGktMjAyNS1taW5pbXVtLTI1Ni1iaXRz` |
| `CORS_ORIGINS` | Orígenes permitidos CORS | No | `http://localhost:4200` |
| `app.jwt.expiration-ms` | Vigencia del JWT en ms | No | `86400000` (24h) |

### Configuración del frontend

| Variable | Descripción | Valor |
|---|---|---|
| `environment.apiUrl` | URL base del backend | `http://localhost:8080/api/v1` |

### Arranque local

**Requisitos previos:** Java 21, Maven 3.9+, Node.js 20+, npm 10+, PostgreSQL (o usar perfil `dev` con H2).

**Backend (perfil dev — H2 en memoria):**
```bash
cd absencehub-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# Disponible en http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# Consola H2:  http://localhost:8080/h2-console
```

**Backend (PostgreSQL):**
```bash
cd absencehub-api
# Configurar variables de entorno DATABASE_URL, DATABASE_USER, DATABASE_PASS, JWT_SECRET
mvn spring-boot:run
```

**Frontend:**
```bash
cd AbsenceHub
npm install
npm start
# Disponible en http://localhost:4200
```

### Despliegue en producción

[PENDIENTE DE CONFIRMAR] — No se detectaron ficheros de CI/CD (`Dockerfile`, `docker-compose.yml`, `.github/workflows/`) en el repositorio. El proyecto arranca como JAR ejecutable (`spring-boot-maven-plugin`) y SPA estática Angular.

---

## 9. Testing

### Estrategia de tests

El proyecto incluye tests unitarios tanto en frontend como en backend. No se detectaron tests de integración end-to-end ni tests de contrato.

### Frontend (Jest)

```bash
cd AbsenceHub
npm test                    # Ejecutar todos los tests
npm run test:watch          # Modo watch
npm run test:coverage       # Con informe de cobertura
```

**Archivos de tests y cobertura:**

| Fichero spec | Tests | Qué cubre |
|---|---|---|
| `login.spec.ts` | 10 | Validación de formulario, toggle password, login fallido, marcado de campos touched |
| `auth.service.spec.ts` | 9 | Login válido/inválido, persistencia localStorage, logout, señales isManager/isAuthenticated |
| `absence.service.spec.ts` | 9 | CRUD mock de ausencias, cálculo de días disponibles, pendingCount, solapamiento |
| `auth.guard.spec.ts` | 5 | authGuard y managerGuard: redirección según rol y estado de autenticación |
| `app.spec.ts` | 1 | Creación del componente raíz |

Cobertura configurada sobre `src/app/**/*.ts` (excluye `*.module.ts` y `main.ts`).

### Backend (JUnit 5 + Mockito)

```bash
cd absencehub-api
mvn test                    # Ejecutar todos los tests
mvn test -Dtest=AbsenceServiceImplTest  # Test específico
```

**Archivos de tests y cobertura:**

| Fichero | Tests | Qué cubre |
|---|---|---|
| `AbsenceServiceImplTest.java` | 7 | Creación de ausencia válida, exceso de días de vacaciones, solapamiento, rango de fechas inválido, rechazo por manager de otro equipo, cálculo de días laborables |
| `AbsenceControllerTest.java` | [PENDIENTE DE CONFIRMAR] — fichero existe pero no se pudo leer |

La configuración de test usa perfil `application-test.yml` con H2 en memoria.

---

## 10. Seguridad

- **Autenticación:** JWT HS256 generado con jjwt 0.12.6. El subject del token es el `userId`. Vigencia de 24h. BCrypt para hash de contraseñas.
- **Autorización:** `@EnableMethodSecurity` + reglas en `SecurityFilterChain`. Tres niveles de acceso: EMPLOYEE (autenticado), MANAGER (MANAGER o ADMIN), ADMIN (solo ADMIN). El manager solo puede aprobar/rechazar ausencias de miembros de su propio equipo (validado en `AbsenceServiceImpl`).
- **Validación de inputs:** Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`) en todos los DTOs de request. El `GlobalExceptionHandler` captura `MethodArgumentNotValidException` y devuelve errores en el formato compartido `{ code, message }`.
- **CORS:** Configurado explícitamente para `http://localhost:4200`. El origen se puede cambiar via variable de entorno `CORS_ORIGINS`.
- **Sesión:** Stateless (`SessionCreationPolicy.STATELESS`). El servidor no mantiene estado de sesión.
- **CSRF:** Deshabilitado (no aplica en APIs stateless con JWT).
- **Secrets:** La clave JWT se lee de variable de entorno `JWT_SECRET`. No está hardcodeada en el código de producción (el valor por defecto del `application.yml` solo sirve para desarrollo).

---

## 11. Deuda técnica y limitaciones

- [ ] **Cálculo de días laborables inconsistente:** El backend (`AbsenceServiceImpl.calculateWorkingDays`) solo excluye fines de semana, **sin excluir festivos**. El frontend (`countWorkingDays`) sí excluye festivos españoles. Esto puede generar discrepancias en `totalDays`.
- [ ] **NotificationService sin backend:** Las notificaciones son 100% en memoria en el frontend (mock). No existe endpoint `/api/v1/notifications` en el backend.
- [ ] **TeamService frontend sin backend:** La gestión de equipos desde el frontend (crear, editar, asignar manager, añadir/quitar miembros) usa un servicio mock en memoria. El backend tiene los endpoints, pero la integración real no está conectada.
- [ ] **AbsenceService frontend sin backend real:** Aunque existen llamadas HTTP en el servicio Angular, los datos mock persisten en señales en memoria. La integración completa frontend↔backend está pendiente de conectar.
- [ ] **Tests backend insuficientes:** Solo hay tests de `AbsenceServiceImpl`. Los controladores, servicios de equipos/usuarios y la capa de seguridad no tienen tests.
- [ ] **Sin CI/CD:** No se detectaron pipelines de integración o despliegue continuo.
- [ ] **Sin Docker:** No hay `Dockerfile` ni `docker-compose.yml` para levantar el entorno completo.
- [ ] **Gestión de manager sin equipo:** El flujo `Admin sin equipos → forzado a /team` está implementado en el guard del frontend, pero no validado en el backend.
- [ ] **Festivos no configurables:** Los festivos españoles están hardcodeados en el frontend. No existe API ni configuración para adaptarlos por comunidad autónoma o empresa.

---

*Documento generado automáticamente por el Agente de Documentación Dual.*
