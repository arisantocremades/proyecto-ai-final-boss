# AbsenceHub — CLAUDE.md

## Qué es este proyecto

Aplicación Angular de gestión de ausencias y vacaciones empresarial. Frontend puro, sin backend real — todos los datos viven en signals en memoria (se resetean al recargar). Tres roles: Employee, Manager, Admin.

## Comandos

```bash
# Desde AbsenceHub/
npm start          # dev server en http://localhost:4200
npm run build      # build de producción
npm test           # Jest
npm run test:watch
```

Instalar dependencias siempre con `--legacy-peer-deps` (PrimeNG v20 requiere Angular 20, el proyecto usa Angular 21).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 21.2 — standalone components, Signals |
| UI | PrimeNG v20.4 + Aura preset (tema violet personalizado) |
| Iconos | PrimeIcons 7 |
| i18n | @ngx-translate/core 17 — ES por defecto, EN secundario |
| Formularios | ReactiveFormsModule (login, new-request) / FormsModule (team) |
| Exportación | jsPDF + jspdf-autotable (PDF), xlsx (Excel) |
| Tests | Jest 30 + jest-preset-angular |

## Estructura de rutas

```
/login              → público
/dashboard          → authGuard (todos los roles)
/calendar           → authGuard
/requests           → authGuard
/requests/new       → authGuard
/team               → authGuard
/manager            → authGuard + managerGuard (solo Manager)
/reports            → authGuard
```

El admin con equipo vacío es redirigido a `/team` al entrar.

## Usuarios mock

| Email | Contraseña | Rol |
|-------|-----------|-----|
| manager@absencehub.com | manager123 | Manager |
| empleado@absencehub.com | empleado123 | Employee |
| admin@absencehub.com | admin123 | Admin |

Sesión persistida en `localStorage` bajo la clave `absencehub_session`.

## Arquitectura de datos (sin backend)

Toda la lógica de estado está en servicios Angular con Signals:

- **AbsenceService** — solicitudes de ausencia (CRUD, aprobación/rechazo, cálculo de días disponibles: 22/año de vacaciones)
- **TeamService** — equipos y miembros (crear equipos, asignar managers, buscar usuarios por email)
- **AuthService** — autenticación y rol del usuario logado
- **LangService** — idioma activo, persistido en `localStorage` (`app-lang`)
- **ExportService** — generación de PDF y Excel para el módulo de informes

Los datos mock están hardcodeados dentro de cada servicio (señales inicializadas con arrays literales).

## Patrones Angular usados

**Signals y computed:**
```ts
readonly myTeam = computed(() => this.teamSvc.getTeamForUser(this.userId()));
```

**Dialog con signal (no usar `[(visible)]`):**
```html
<p-dialog [visible]="showDialog()" (visibleChange)="showDialog.set($event)">
```

**p-select con ngModel y signal:**
```html
<p-select [ngModel]="mySignal()" (ngModelChange)="mySignal.set($event)" />
```
Requiere `FormsModule` importado en el componente.

**p-select con opciones traducidas** — usar `ng-template pTemplate="item"` y `pTemplate="selectedItem"` con el pipe `translate` dentro, nunca pasar la key directa a `optionLabel`.

**Traducciones en código TS** — usar `TranslateService.instant()`, no el pipe (el pipe solo funciona en plantillas).

## UI: PrimeNG v20 + tema violet

**No usar nombres de componentes antiguos:**
- `p-dropdown` → `p-select`
- `p-calendar` → `p-datepicker`
- `p-sidebar` → `p-drawer`
- `p-inputSwitch` → `p-toggleswitch`
- `styleClass` en `p-table` → usar `class` directamente

**`[fluid]="true"`** en `p-button` para ancho completo (no `width: 100%` en CSS).

**`p-message` — content projection** (no `[text]` que está deprecated):
```html
<p-message severity="error">{{ errorSignal() }}</p-message>
<p-message severity="warn">{{ key | translate }}</p-message>
```

**Toast** — `MessageService` ya está provisto en `app.config.ts` y `<p-toast />` en `app.html`. Inyectar y llamar directamente:
```ts
this.messageSvc.add({ severity: 'success', summary: '...', detail: '...', life: 3000 });
```

## Variables CSS del tema

Definidas en `src/styles.scss` (`:root`):

```
--brand-primary        #7c3aed
--brand-primary-dark   #5b21b6
--brand-primary-50     #f5f3ff   ← fondos suaves
--sidebar-bg-from      #3b0764
--sidebar-bg-to        #6d28d9
--bg-app               #f7f5ff
--bg-card              #ffffff
--text-heading         #1e1b4b
--text-body            #374151
--text-muted           #6b7280
--border-light         #ede9fe
--border-default       #ddd6fe
--status-pending-*     amarillo pastel
--status-approved-*    verde pastel
--status-rejected-*    rosa pastel
```

Clases de layout reutilizables en `styles.scss`: `.page`, `.page-header`, `.section`, `.section-header`, `.stat-card`, `.stats-grid`, `.empty-state`.

## i18n

- Ficheros en `public/i18n/es-ES.json` y `en-US.json`
- Namespaces: `nav`, `layout`, `user`, `login`, `dashboard`, `requests`, `newRequest`, `manager`, `calendar`, `reports`, `team`, `types`, `statuses`, `export`
- Al añadir texto nuevo, añadir siempre la clave en **ambos** ficheros
- Interpolación: `"key": "Hola {{name}}"` → `translate.instant('key', { name: 'Ana' })`

## Convenciones del proyecto

- Todos los componentes son **standalone** — importar los módulos necesarios en cada `@Component`
- Sin lazy loading manual — Angular CLI lo gestiona por ruta en `app.routes.ts`
- SCSS con variables CSS propias, sin Tailwind, sin utility classes
- Cuanto menos CSS nativo mejor: preferir componentes y props de PrimeNG
- Comentarios solo si el "por qué" no es obvio — no comentar el "qué"
- TypeScript strict activado — sin `any` implícito, sin `!` innecesarios
