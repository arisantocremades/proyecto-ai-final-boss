# AbsenceHub

Sistema de gestión de ausencias para equipos, desarrollado con **Angular 21** (frontend) y **Spring Boot 3** (backend).

## Puesta en marcha rápida

### 1. Backend (Spring Boot + H2)

```bash
cd absencehub-api

# Con Maven Wrapper (Linux/Mac)
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Con Maven Wrapper (Windows)
mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

El backend arranca en **http://localhost:8080**.  
Los datos de ejemplo se insertan automáticamente al iniciar con el perfil `dev` (vía `DataInitializer.java`).

| Recurso | URL |
|---------|-----|
| API base | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Consola H2 | http://localhost:8080/h2-console (JDBC: `jdbc:h2:mem:absencehub_dev`) |

### 2. Frontend (Angular)

```bash
cd AbsenceHub
npm install
npm start           # http://localhost:4200
```

---

## Funcionalidades

| Módulo | Rol | Descripción |
|--------|-----|-------------|
| Login | Todos | Acceso con email y contraseña, validación de formulario reactivo |
| Dashboard | Todos | Resumen de días disponibles, solicitudes propias y próximas ausencias |
| Calendario | Todos | Vista mensual con ausencias aprobadas del equipo |
| Mis solicitudes | Empleado | Historial de solicitudes y formulario para crear nuevas |
| Panel manager | Manager | Cola de aprobación con acciones aprobar / rechazar (con comentario) |

### Credenciales de demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Empleado | `empleado@absencehub.com` | `empleado123` |
| Manager | `manager@absencehub.com` | `manager123` |
| Admin | `admin@absencehub.com` | `admin123` |
| Empleado 2 | `ana@absencehub.com` | `ana123` |
| Empleado 3 | `pedro@absencehub.com` | `pedro123` |
| Empleado 4 | `laura@absencehub.com` | `laura123` |

---

## Stack técnico

### Frontend
- **Angular 21** — Standalone components, Signals, Reactive Forms, functional guards
- **PrimeNG v20** — Componentes UI (tabla, diálogo, botones, inputs)
- **@ngx-translate** — Internacionalización (es-ES / en-US)
- **Jest 30** + **jest-preset-angular 16** — Tests unitarios
- **TypeScript 5.9** / **SCSS**

### Backend
- **Spring Boot 3.3.4** — REST API con Spring Security + JWT
- **Spring Data JPA** + **Hibernate** — Acceso a datos
- **H2** (dev) / **PostgreSQL** (prod) — Base de datos
- **jjwt 0.12.6** — Generación y validación de tokens JWT
- **MapStruct** — Mapeo de entidades a DTOs
- **SpringDoc OpenAPI** — Documentación Swagger automática

---

## Estructura del proyecto

```
ai-final-boss/
├── AbsenceHub/               ← Frontend Angular
│   └── src/app/
│       ├── auth/             # Login, guards, AuthService
│       ├── dashboard/        # Resumen personal
│       ├── calendar/         # Vista mensual
│       ├── requests/         # Listado + nueva solicitud
│       ├── manager/          # Panel de aprobación
│       ├── layout/           # Shell con sidebar
│       └── shared/           # Modelos, servicios, interceptors
└── absencehub-api/           ← Backend Spring Boot
    └── src/main/java/.../
        ├── controller/       # REST controllers
        ├── service/          # Lógica de negocio
        ├── entity/           # JPA entities
        ├── dto/              # Request / Response DTOs
        ├── repository/       # Spring Data JPA repos
        ├── security/         # JWT filter, UserDetails
        └── config/           # Security, CORS, DataInitializer
```

---

## Comandos frontend

```bash
# Servidor de desarrollo
npm start                  # http://localhost:4200

# Tests
npm test                   # Jest (una sola pasada)
npm run test:watch         # Jest en modo watch
npm run test:coverage      # Jest con cobertura

# Build de producción
npm run build
```

## Rutas

```
/login              → Login (pública)
/dashboard          → Dashboard (autenticado)
/calendar           → Calendario (autenticado)
/requests           → Mis solicitudes (autenticado)
/requests/new       → Nueva solicitud (autenticado)
/manager            → Panel manager (solo rol manager)
```
