# AbsenceHub

Sistema de gestión de ausencias para equipos, desarrollado con **Angular 21** y arquitectura de componentes standalone.

## Funcionalidades

| Módulo | Rol | Descripción |
|---|---|---|
| Login | Todos | Acceso con email y contraseña, validación de formulario reactivo |
| Dashboard | Todos | Resumen de días disponibles, solicitudes propias y próximas ausencias del equipo |
| Calendario | Todos | Vista mensual con ausencias aprobadas superpuestas |
| Mis solicitudes | Empleado | Historial de solicitudes y formulario para crear nuevas |
| Panel manager | Manager | Cola de aprobación con acciones de aprobar/rechazar |

### Credenciales de demo

| Rol | Email | Contraseña |
|---|---|---|
| Empleado | `empleado@absencehub.com` | `empleado123` |
| Manager | `manager@absencehub.com` | `manager123` |

## Stack técnico

- **Angular 21** — Standalone components, Signals, Reactive Forms, functional guards
- **Jest 30** + **jest-preset-angular 16** — Tests unitarios
- **TypeScript 5.9**
- **SCSS** — Sin librerías de componentes externas

## Estructura del proyecto

```
src/app/
├── auth/
│   ├── guards/         # authGuard, managerGuard
│   ├── login/          # Componente de login
│   ├── models/         # UserRole, User
│   └── services/       # AuthService (mock + localStorage)
├── calendar/           # Calendario mensual (lunes-inicio, 42 celdas)
├── dashboard/          # Resumen personal y del equipo
├── layout/             # Shell con sidebar y navegación
├── manager/            # Panel de aprobación
├── requests/
│   ├── new-request/    # Formulario nueva solicitud
│   └── requests.ts     # Listado de solicitudes propias
└── shared/
    ├── models/         # AbsenceRequest, tipos y etiquetas
    └── services/       # AbsenceService (22 días/año, mock data)
```

## Instalación

```bash
npm install
```

## Comandos

```bash
# Servidor de desarrollo
npm start           # http://localhost:4200

# Tests
npm test            # Jest (una sola pasada)
npm run test:watch  # Jest en modo watch
npm run test:coverage # Jest con cobertura

# Build de producción
npm run build
```

## Tests

74 tests unitarios distribuidos en 10 suites:

```
auth/services/auth.service.spec.ts          — AuthService
shared/services/absence.service.spec.ts     — AbsenceService
auth/guards/auth.guard.spec.ts              — authGuard, managerGuard
auth/login/login.spec.ts                    — Login component
dashboard/dashboard.spec.ts                 — Dashboard component
calendar/calendar.spec.ts                   — Calendar component
requests/requests.spec.ts                   — Requests component
requests/new-request/new-request.spec.ts    — NewRequest component
manager/manager.spec.ts                     — Manager component
app/app.spec.ts                             — App root
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
