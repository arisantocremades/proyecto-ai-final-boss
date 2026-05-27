# AbsenceHub — CLAUDE-BBDD.md

## Qué es este archivo

Contexto especializado del agente de base de datos para AbsenceHub. Se carga junto a
`CLAUDE-BACKEND.md` cuando la tarea involucra esquema, migraciones, queries o rendimiento
de la base de datos. El backend es la fuente de verdad para los contratos de entidad:
nunca proponer cambios de esquema que rompan las entidades JPA existentes sin actualizar
ambos lados.

---

## Protocolo CLAUDE-STATE.md

Este agente documenta todos sus cambios en `CLAUDE-STATE.md`, archivo compartido con los
agentes de frontend y backend. Es obligatorio seguir este protocolo en cada tarea.

**Al inicio de cada tarea:**
1. Leer `CLAUDE-STATE.md` para conocer el estado actual del proyecto.
2. Mover a 🔄 "En progreso" las tareas de DATABASE que se van a abordar.

**Al finalizar cada tarea:**
1. Mover las tareas completadas a ✅ con fecha y descripción concisa.
2. Añadir una fila en el historial con el formato: `[YYYY-MM-DD] [DATABASE] descripción`.
3. Registrar en "Decisiones técnicas" cualquier decisión que afecte a BACKEND o FRONTEND.
4. Actualizar la barra de progreso `DATABASE` si procede.

> ⚠️ Nunca terminar una tarea sin actualizar `CLAUDE-STATE.md`. Es la fuente de verdad
> compartida entre los tres agentes.

---

## Stack de base de datos

| Capa | Tecnología |
|------|-----------|
| Motor | PostgreSQL 16 (prod) |
| BD en tests | H2 en memoria (modo PostgreSQL) |
| Migraciones | Flyway (versionado) |
| ORM | Hibernate 6 / Spring Data JPA |
| Conexión | HikariCP (pool por defecto de Spring Boot) |
| Herramienta CLI | psql |

---

## Esquema de base de datos

### Tabla `teams`

```sql
CREATE TABLE teams (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    manager_id  BIGINT REFERENCES users(id) ON DELETE SET NULL
);
```

> `teams` se crea antes que `users` por la referencia cruzada (ver nota en migraciones).

---

### Tabla `users`

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,          -- BCrypt hash
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL            -- EMPLOYEE | MANAGER | ADMIN
                        CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    team_id         BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    available_days  INTEGER NOT NULL DEFAULT 22,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT users_email_format CHECK (email LIKE '%@%')
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_team_id  ON users(team_id);
CREATE INDEX idx_users_role     ON users(role);
```

---

### Tabla `absence_requests`

```sql
CREATE TABLE absence_requests (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type             VARCHAR(20) NOT NULL
                         CHECK (type IN ('VACATION', 'SICK_LEAVE', 'PERSONAL', 'OTHER')),
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    total_days       INTEGER NOT NULL CHECK (total_days > 0),
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reason           VARCHAR(500),
    manager_comment  VARCHAR(500),
    reviewed_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at      TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT absence_dates_valid CHECK (end_date >= start_date),
    CONSTRAINT manager_comment_required
        CHECK (status != 'REJECTED' OR manager_comment IS NOT NULL)
);

CREATE INDEX idx_absence_user_id    ON absence_requests(user_id);
CREATE INDEX idx_absence_status     ON absence_requests(status);
CREATE INDEX idx_absence_start_date ON absence_requests(start_date);
CREATE INDEX idx_absence_user_year  ON absence_requests(user_id, EXTRACT(YEAR FROM start_date));
```

---

## Relaciones entre tablas

```
teams
 ├── manager_id → users.id   (un Manager por equipo)
 └── [members]  ← users.team_id

users
 ├── team_id → teams.id      (nullable: Admin puede no tener equipo)
 └── absence_requests ← absence_requests.user_id

absence_requests
 ├── user_id    → users.id
 └── reviewed_by → users.id
```

**Referencia circular `teams ↔ users`:** `teams.manager_id` referencia a `users.id` y
`users.team_id` referencia a `teams.id`. Solución en migraciones: crear ambas tablas sin
FK cruzada, luego añadir las FK con `ALTER TABLE` (ver V2 más abajo).

---

## Migraciones Flyway

Las migraciones viven en `src/main/resources/db/migration/` y siguen el patrón:
`V{version}__{descripcion_snake_case}.sql`

### Estructura de archivos

```
src/main/resources/db/migration/
├── V1__create_teams_and_users.sql
├── V2__add_foreign_keys.sql
├── V3__create_absence_requests.sql
├── V4__seed_initial_data.sql
└── V5__add_indexes.sql
```

---

### V1__create_teams_and_users.sql

```sql
-- Crear tablas sin FK cruzadas para evitar dependencia circular
CREATE TABLE teams (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL
                        CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    team_id         BIGINT,
    available_days  INTEGER NOT NULL DEFAULT 22,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

### V2__add_foreign_keys.sql

```sql
-- FK cruzadas: añadir una vez que ambas tablas existen
ALTER TABLE teams
    ADD COLUMN manager_id BIGINT,
    ADD CONSTRAINT fk_teams_manager
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_team
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Índices básicos
CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
```

---

### V3__create_absence_requests.sql

```sql
CREATE TABLE absence_requests (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    type             VARCHAR(20) NOT NULL
                         CHECK (type IN ('VACATION', 'SICK_LEAVE', 'PERSONAL', 'OTHER')),
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    total_days       INTEGER NOT NULL CHECK (total_days > 0),
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reason           VARCHAR(500),
    manager_comment  VARCHAR(500),
    reviewed_by      BIGINT,
    reviewed_at      TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT absence_dates_valid CHECK (end_date >= start_date),
    CONSTRAINT manager_comment_required
        CHECK (status != 'REJECTED' OR manager_comment IS NOT NULL),
    CONSTRAINT fk_absence_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_absence_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_absence_user_id    ON absence_requests(user_id);
CREATE INDEX idx_absence_status     ON absence_requests(status);
CREATE INDEX idx_absence_start_date ON absence_requests(start_date);
CREATE INDEX idx_absence_user_year
    ON absence_requests(user_id, EXTRACT(YEAR FROM start_date));
```

---

### V4__seed_initial_data.sql

Datos iniciales que replican los usuarios mock del frontend. Las contraseñas son el hash
BCrypt de los valores indicados en `CLAUDE.md`.

```sql
-- Equipo inicial (sin manager aún)
INSERT INTO teams (name) VALUES ('Engineering');

-- Usuarios mock — contraseñas en BCrypt
-- manager123  → $2a$10$...
-- empleado123 → $2a$10$...
-- admin123    → $2a$10$...
INSERT INTO users (email, password, name, role, team_id, available_days) VALUES
    ('manager@absencehub.com',
     '$2a$10$GHASHplaceholderForManager',
     'Manager Demo', 'MANAGER', 1, 22),
    ('empleado@absencehub.com',
     '$2a$10$GHASHplaceholderForEmployee',
     'Empleado Demo', 'EMPLOYEE', 1, 22),
    ('admin@absencehub.com',
     '$2a$10$GHASHplaceholderForAdmin',
     'Admin Demo', 'ADMIN', NULL, 22);

-- Asignar manager al equipo
UPDATE teams SET manager_id = (SELECT id FROM users WHERE email = 'manager@absencehub.com')
WHERE name = 'Engineering';
```

> ⚠️ Generar los hashes BCrypt reales con `BCryptPasswordEncoder.encode()` antes de ejecutar
> en producción. Los valores `$2a$10$GHASHplaceholder...` son solo marcadores.

---

### V5__add_indexes.sql

```sql
-- Índices adicionales para rendimiento en consultas frecuentes
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_is_active    ON users(is_active);
CREATE INDEX idx_absence_reviewed_by ON absence_requests(reviewed_by);
CREATE INDEX idx_teams_name         ON teams(name);
```

---

## Queries clave

Estas queries replican exactamente lo que necesitan los repositorios JPA definidos en
`CLAUDE-BACKEND.md`. Útiles para depuración, informes ad-hoc o validar rendimiento.

### Días de vacaciones usados por usuario en un año

```sql
SELECT
    u.id,
    u.name,
    u.available_days,
    COALESCE(SUM(a.total_days), 0)          AS used_days,
    u.available_days - COALESCE(SUM(a.total_days), 0) AS remaining_days
FROM users u
LEFT JOIN absence_requests a
    ON a.user_id = u.id
    AND EXTRACT(YEAR FROM a.start_date) = :year
    AND a.status != 'REJECTED'
WHERE u.id = :userId
GROUP BY u.id, u.name, u.available_days;
```

---

### Validar solapamiento de ausencias

```sql
SELECT COUNT(*) > 0 AS has_overlap
FROM absence_requests
WHERE user_id   = :userId
  AND status   IN ('PENDING', 'APPROVED')
  AND start_date <= :endDate
  AND end_date   >= :startDate;
```

---

### Ausencias del equipo de un manager (vista Manager)

```sql
SELECT
    a.id,
    u.name      AS employee_name,
    a.type,
    a.start_date,
    a.end_date,
    a.total_days,
    a.status,
    a.reason,
    a.created_at
FROM absence_requests a
JOIN users u ON u.id = a.user_id
JOIN teams t ON t.id = u.team_id
WHERE t.manager_id = :managerId
ORDER BY a.created_at DESC;
```

---

### Informe global de ausencias (vista Admin / Reports)

```sql
SELECT
    a.id,
    u.name          AS employee_name,
    u.email,
    t.name          AS team_name,
    a.type,
    a.start_date,
    a.end_date,
    a.total_days,
    a.status,
    rv.name         AS reviewed_by_name,
    a.reviewed_at,
    a.created_at
FROM absence_requests a
JOIN  users u  ON u.id  = a.user_id
LEFT JOIN teams t  ON t.id  = u.team_id
LEFT JOIN users rv ON rv.id = a.reviewed_by
WHERE
    (:startDate  IS NULL OR a.start_date >= :startDate)
    AND (:endDate    IS NULL OR a.end_date   <= :endDate)
    AND (:type       IS NULL OR a.type       = :type)
    AND (:status     IS NULL OR a.status     = :status)
ORDER BY a.created_at DESC;
```

---

### Estadísticas resumen (Reports summary)

```sql
SELECT
    COUNT(*)                                            AS total_requests,
    COUNT(*) FILTER (WHERE status = 'PENDING')          AS pending,
    COUNT(*) FILTER (WHERE status = 'APPROVED')         AS approved,
    COUNT(*) FILTER (WHERE status = 'REJECTED')         AS rejected,
    COALESCE(SUM(total_days) FILTER (WHERE status = 'APPROVED'), 0) AS total_days_approved
FROM absence_requests
WHERE EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM NOW());
```

---

### Buscar usuario por email (TeamService.findByEmail)

```sql
SELECT id, email, name, role, available_days
FROM users
WHERE email ILIKE '%' || :query || '%'
  AND is_active = TRUE
ORDER BY name;
```

---

## Configuración de conexión

### application.yml (dev)

```yaml
spring:
  datasource:
    url:      ${DATABASE_URL:jdbc:postgresql://localhost:5432/absencehub}
    username: ${DATABASE_USER:postgres}
    password: ${DATABASE_PASS:postgres}
    hikari:
      maximum-pool-size:    10
      minimum-idle:         2
      connection-timeout:   30000   # 30s
      idle-timeout:         600000  # 10min
      max-lifetime:         1800000 # 30min
  jpa:
    hibernate:
      ddl-auto: validate    # prod: nunca auto-crear; Flyway gestiona el esquema
    show-sql: false
    properties:
      hibernate:
        format_sql:          true
        jdbc.batch_size:     20
        order_inserts:       true
        order_updates:       true
  flyway:
    enabled:   true
    locations: classpath:db/migration
    baseline-on-migrate: false   # true solo en BD ya existente sin historial Flyway
```

### application-test.yml (tests con H2)

```yaml
spring:
  datasource:
    url:        jdbc:h2:mem:absencehub_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop   # H2 se recrea en cada test run
  flyway:
    enabled: false            # H2 usa ddl-auto; Flyway solo en PostgreSQL real
```

---

## Convenciones del esquema

| Aspecto | Convención |
|---------|-----------|
| Nombres de tabla | `snake_case` plural (`absence_requests`, `teams`) |
| Nombres de columna | `snake_case` (`start_date`, `manager_comment`) |
| Claves primarias | `BIGSERIAL` — autoincremental, nunca UUID salvo requisito explícito |
| Claves foráneas | Prefijo `fk_` + tabla + campo (`fk_absence_user`) |
| Índices | Prefijo `idx_` + tabla + campo(s) (`idx_users_email`) |
| Enums en BD | `VARCHAR` + `CHECK` constraint — no tipo ENUM de PostgreSQL (más fácil migrar) |
| Fechas | `DATE` para `LocalDate`, `TIMESTAMP` para `LocalDateTime` — sin zona horaria |
| Booleanos | `BOOLEAN` nativo de PostgreSQL |
| Textos largos | `VARCHAR(n)` con límite explícito — igual que las anotaciones `@Size` del backend |
| Soft delete | Campo `is_active` en `users` — no borrar físicamente usuarios con ausencias |

---

## Procedimientos de mantenimiento

### Crear la base de datos local

```bash
psql -U postgres -c "CREATE DATABASE absencehub;"
psql -U postgres -c "CREATE USER absencehub_user WITH PASSWORD 'absencehub_pass';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE absencehub TO absencehub_user;"
```

### Ejecutar migraciones manualmente

```bash
# Spring Boot ejecuta Flyway automáticamente al arrancar.
# Para ejecutar solo las migraciones sin arrancar la app:
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/absencehub \
    -Dflyway.user=postgres -Dflyway.password=postgres
```

### Ver estado de migraciones

```bash
./mvnw flyway:info
```

### Reparar checksum roto (solo dev)

```bash
# Útil si se modifica una migración ya aplicada por error
./mvnw flyway:repair
```

### Reset completo de BD local (dev)

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS absencehub;"
psql -U postgres -c "CREATE DATABASE absencehub;"
# Arrancar la app → Flyway re-aplica todas las migraciones
```

---

## Incompatibilidades a vigilar activamente

| Riesgo | Causa | Solución |
|--------|-------|---------|
| Enum case mismatch | PostgreSQL `CHECK` espera `VACATION`, JPA serializa como STRING | Verificar `@Enumerated(EnumType.STRING)` en entidades |
| `TIMESTAMP` con zona horaria | `TIMESTAMP WITH TIME ZONE` vs `TIMESTAMP` | Usar `TIMESTAMP` plano; el backend maneja la zona en aplicación |
| FK circular en migración | `teams.manager_id` ↔ `users.team_id` | Crear tablas sin FK, añadir con `ALTER TABLE` en V2 |
| `ddl-auto: validate` falla | Esquema en BD no coincide con entidades JPA | Revisar que todas las migraciones Flyway estén aplicadas |
| H2 incompatibilidad | Algunas funciones PostgreSQL no existen en H2 | Usar `EXTRACT()`, `COALESCE()`, `ILIKE` con modo `MODE=PostgreSQL` |
| Flyway checksum roto | Editar migración ya aplicada | Nunca editar migraciones ya versionadas; crear una nueva V{n+1} |
| Pool agotado en tests | HikariCP con pool pequeño + tests paralelos | `maximum-pool-size: 5` en profile `test` |
| `available_days` negativo | Sin constraint en BD | Añadir `CHECK (available_days >= 0)` si se requiere validación en capa BD |

---

## Variables de entorno

```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/absencehub
DATABASE_USER=postgres
DATABASE_PASS=postgres
```

En producción, estas variables se inyectan vía plataforma (Docker, Kubernetes, etc.).
Nunca hardcodear credenciales fuera de `application-test.yml`.
