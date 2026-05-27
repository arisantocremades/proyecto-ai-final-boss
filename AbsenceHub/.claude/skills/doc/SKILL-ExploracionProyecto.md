# Skill: Exploración de Proyecto

## Propósito
Recorrer y leer de forma sistemática un proyecto de software completo para extraer
toda la información necesaria antes de generar documentación.

---

## Paso 1 — Mapa de estructura

```bash
find . \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/.nuxt/*' \
  -not -path '*/out/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  -not -path '*/vendor/*' \
  -not -path '*/target/*' \
  -not -path '*/.cache/*' \
  -not -path '*/coverage/*' \
  -not -path '*/.turbo/*' \
  | sort
```

Guarda mentalmente el árbol completo. Identifica:
- Tipo de proyecto (frontend, backend, fullstack, monorepo, librería, CLI...)
- Lenguaje(s) principal(es)
- Framework(s) usado(s)
- Si es monorepo (presencia de `packages/`, `apps/`, `workspace` en manifiestos)

---

## Paso 2 — Ficheros de manifiesto y configuración

Lee **todos** los que existan, en este orden de prioridad:

**Gestores de paquetes / dependencias:**
- `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `requirements.txt`, `pyproject.toml`, `Pipfile`, `setup.py`, `setup.cfg`
- `Cargo.toml`, `Cargo.lock`
- `go.mod`, `go.sum`
- `pom.xml`, `build.gradle`, `build.gradle.kts`
- `Gemfile`, `*.gemspec`
- `composer.json`

**Configuración de aplicación:**
- `.env.example`, `.env.sample`, `.env.template`
- `vite.config.*`, `next.config.*`, `nuxt.config.*`, `webpack.config.*`
- `tsconfig.json`, `jsconfig.json`
- `tailwind.config.*`, `postcss.config.*`
- `eslint.config.*`, `.eslintrc.*`, `prettier.config.*`
- `jest.config.*`, `vitest.config.*`, `pytest.ini`, `conftest.py`

**Infraestructura y despliegue:**
- `Dockerfile`, `docker-compose.yml`, `docker-compose.*.yml`
- `kubernetes/`, `k8s/`, `helm/`
- `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `bitbucket-pipelines.yml`
- `vercel.json`, `netlify.toml`, `render.yaml`, `fly.toml`
- `terraform/`, `*.tf`

**Base de datos:**
- `migrations/`, `db/migrate/`, `alembic/`
- `schema.prisma`, `*.sql`, `schema.rb`
- `models/`, `entities/`

---

## Paso 3 — Entry points y núcleo de la aplicación

Lee en este orden:
1. `README.md`, `README.rst` (si existen)
2. Entry points principales: `main.*`, `index.*`, `app.*`, `server.*`, `api.*`, `cli.*`
3. Fichero raíz de cada módulo o paquete

---

## Paso 4 — Lógica de negocio

Lee el contenido de los directorios más relevantes. Prioridad:

| Directorio | Qué contiene |
|---|---|
| `src/`, `app/`, `lib/` | Núcleo de la aplicación |
| `routes/`, `api/`, `pages/` | Endpoints y rutas |
| `controllers/`, `handlers/` | Lógica de control |
| `services/`, `usecases/` | Lógica de negocio |
| `models/`, `schemas/`, `entities/` | Modelos de datos |
| `components/`, `views/`, `templates/` | UI/Presentación |
| `middleware/`, `interceptors/` | Capas transversales |
| `utils/`, `helpers/`, `common/` | Utilidades compartidas |
| `config/`, `settings/` | Configuración en código |
| `hooks/`, `composables/`, `stores/` | Estado y lógica reutilizable |

---

## Paso 5 — Tests

Lee los directorios de tests para entender qué está cubierto:
- `tests/`, `test/`, `__tests__/`, `spec/`
- Ficheros `*.test.*`, `*.spec.*`, `*_test.*`

Los tests revelan comportamiento esperado y casos de uso reales.

---

## Paso 6 — Documentación existente

- `docs/`, `wiki/`, `documentation/`
- `CHANGELOG.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`
- Comentarios JSDoc, docstrings, OpenAPI/Swagger si existen (`openapi.yml`, `swagger.json`)

---

## Paso 7 — Síntesis antes de escribir

Antes de generar cualquier documento, construye mentalmente este resumen:

```
SÍNTESIS DEL PROYECTO
─────────────────────
Nombre: ___
Tipo: ___
Problema que resuelve: ___
Stack: ___
Arquitectura: ___
Módulos principales: ___
Funcionalidades operativas: ___
Integraciones externas: ___
Flujos principales del usuario: ___
Estado del proyecto (alpha/beta/producción): ___
Qué falta o está incompleto: ___
```

Solo cuando esta síntesis esté completa, pasa a generar los documentos.

---

## Notas importantes

- **Ignora siempre:** `node_modules/`, `.git/`, `dist/`, `build/`, `coverage/`, `__pycache__/`, `venv/`, `.next/`
- Si es un **monorepo**, repite los pasos 2-6 para cada paquete en `packages/` o `apps/`
- Si un fichero es muy largo (>500 líneas), lee al menos las primeras 100 y las últimas 50 líneas,
  y busca secciones clave por nombre de función o clase
- **Nunca supongas** lo que hace un módulo sin haberlo leído. Si no puedes leerlo, márcalo como
  `[PENDIENTE DE CONFIRMAR]`
