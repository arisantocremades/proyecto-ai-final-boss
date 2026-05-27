# Skill: Documentación Técnica en Markdown

## Propósito
Generar un documento técnico completo y preciso en formato Markdown
a partir de la síntesis extraída del proyecto.

---

## Fichero de salida

```
/docs/DOCUMENTACION-TECNICA.md
```

Si la carpeta `docs` no existe, créala antes de escribir.

---

## Plantilla

Usa exactamente esta estructura. Rellena cada sección con la información real del proyecto.
Elimina las secciones que genuinamente no apliquen (p.ej. "API/Endpoints" en una CLI sin API).

````markdown
# Documentación Técnica — {NOMBRE_DEL_PROYECTO}

> **Versión:** {versión si está disponible}
> **Última actualización:** {fecha actual}
> **Estado:** {Alpha / Beta / Producción}

---

## 1. Visión general

{Descripción técnica de qué es el sistema, qué problema resuelve y cómo está
estructurado a alto nivel. 2-4 párrafos.}

---

## 2. Stack tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Lenguaje principal | | |
| Framework | | |
| Base de datos | | |
| ORM / Query builder | | |
| Autenticación | | |
| Testing | | |
| Build / Bundler | | |
| Infraestructura | | |
| CI/CD | | |

{Añade o elimina filas según lo que exista en el proyecto.}

---

## 3. Arquitectura

{Descripción de las capas, módulos y patrones usados.
Indica si es monolito, microservicios, serverless, event-driven, etc.}

{Si la arquitectura tiene capas claras, represéntala con ASCII:}

```
┌─────────────────────────────────┐
│           {Capa N}              │
├─────────────────────────────────┤
│           {Capa N-1}            │
├─────────────────────────────────┤
│           {Capa N-2}            │
└─────────────────────────────────┘
```

{Patrones detectados: MVC, Repository, CQRS, Hexagonal, etc.}

---

## 4. Estructura del proyecto

```
{árbol de directorios real del proyecto con comentarios}

{nombre-del-proyecto}/
├── src/                    # {descripción}
│   ├── modules/            # {descripción}
│   └── ...
├── tests/                  # {descripción}
├── docs/                   # Documentación
└── ...
```

---

## 5. Modelos de datos

{Para cada entidad principal:}

### {NombreEntidad}

| Campo | Tipo | Descripción |
|---|---|---|
| id | | |
| ... | | |

{Relaciones entre entidades si existen.}

---

## 6. API / Endpoints

{Si el proyecto expone una API:}

### Autenticación

{Cómo se autentica. Bearer token, session, API key, etc.}

### Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/ruta` | Sí/No | {descripción} |
| POST | `/ruta` | Sí/No | {descripción} |

{Para endpoints relevantes, describe el body de request/response:}

#### `POST /ruta/ejemplo`

**Request:**
```json
{
  "campo": "tipo"
}
```

**Response `200`:**
```json
{
  "campo": "valor"
}
```

---

## 7. Flujos principales

{Describe técnicamente los flujos de datos más importantes.}

### Flujo: {Nombre del flujo}

1. {Paso 1 — qué módulo recibe la petición}
2. {Paso 2 — qué lógica ejecuta}
3. {Paso 3 — qué devuelve o persiste}

---

## 8. Integraciones externas

| Servicio | Propósito | Credencial requerida |
|---|---|---|
| {Nombre} | {Para qué se usa} | {Variable de entorno} |

---

## 9. Configuración y despliegue

### Variables de entorno

| Variable | Descripción | Requerida | Valor por defecto |
|---|---|---|---|
| `VARIABLE` | {descripción} | Sí/No | {valor} |

### Instalación local

```bash
# 1. Clonar el repositorio
git clone {url}
cd {nombre-proyecto}

# 2. Instalar dependencias
{comando según el stack}

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 4. Levantar la base de datos (si aplica)
{comando}

# 5. Ejecutar migraciones (si aplica)
{comando}

# 6. Arrancar en desarrollo
{comando}
```

### Docker (si aplica)

```bash
{comandos docker-compose}
```

### Despliegue en producción

{Instrucciones o referencia al CI/CD detectado.}

---

## 10. Testing

### Estrategia de tests

{Qué tipos de tests existen: unitarios, integración, e2e, etc.}

### Ejecutar tests

```bash
{comando para ejecutar todos los tests}
{comando para tests con cobertura}
{comando para tests en modo watch}
```

### Cobertura

{Qué está cubierto y qué no, según lo detectado en el código.}

---

## 11. Seguridad

{Mecanismos detectados en el código:}

- **Autenticación:** {cómo se implementa}
- **Autorización:** {roles, permisos, guards detectados}
- **Validación de inputs:** {librerías o patrones usados}
- **Protección CSRF/XSS:** {si aplica}
- **Rate limiting:** {si existe}
- **Secrets:** {cómo se gestionan las credenciales}

---

## 12. Deuda técnica y limitaciones

{Lista honesta de lo que falta, está hardcodeado o es mejorable.}

- [ ] {Item de deuda técnica}
- [ ] {Funcionalidad incompleta}
- [ ] {Mejora pendiente}

{Usa `[PENDIENTE DE CONFIRMAR]` para lo que no puedas deducir del código.}

---

*Documento generado automáticamente por el Agente de Documentación Dual.*
````

---

## Reglas de escritura

- **Nunca inventes** nada. Solo escribe lo que hayas leído en el código.
- Usa `[PENDIENTE DE CONFIRMAR]` cuando algo no esté claro en el código.
- Si una sección no aplica, elimínala del documento final.
- Los bloques de código deben usar el lenguaje correcto en el fence (` ```bash `, ` ```json `, etc.)
- Las tablas deben estar alineadas y ser legibles.
- Máximo 1 nivel de anidación en listas. Si necesitas más estructura, usa subsecciones (`###`).
