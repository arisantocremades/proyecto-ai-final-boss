-- =============================================================================
-- AbsenceHub — Datos de ejemplo
-- =============================================================================
-- Compatible con: PostgreSQL (perfil prod/staging)
--                 H2 (perfil dev con spring.sql.init.mode=always)
--
-- Equivalente a los datos que inserta DataInitializer.java en perfil 'dev'.
-- En perfil 'dev', DataInitializer.java comprueba `userRepository.count() > 0`
-- antes de insertar, por lo que este script y DataInitializer no duplican datos.
--
-- Contraseñas (BCrypt cost=10):
--   manager@absencehub.com  → manager123
--   empleado@absencehub.com → empleado123
--   ana@absencehub.com      → ana123
--   pedro@absencehub.com    → pedro123
--   laura@absencehub.com    → laura123
--   admin@absencehub.com    → admin123
-- =============================================================================

-- ── Usuarios (sin team_id, se actualizan después) ──────────────────────────

INSERT INTO users (id, email, password, name, role, available_days, is_active, team_id)
VALUES
  (1, 'manager@absencehub.com',
      '$2b$10$AlRcfZh5Mt2VjNELEpyU/O.nf7oheLSl1s8UWnj./0p5DZ53gni6W',
      'María López',    'MANAGER',  22, true, NULL),
  (2, 'empleado@absencehub.com',
      '$2b$10$WELRDxZfQzobzNCbfUb7YuRjBBEfrLXOqR5VhY82Dr5cJEd72doTW',
      'Carlos Martínez','EMPLOYEE', 22, true, NULL),
  (3, 'ana@absencehub.com',
      '$2b$10$85DbIBnSzS8AA/hZi9mYpe83NyCjHP3b2D6f/pnPUaY7VJxlTI0Y6',
      'Ana Rodríguez',  'EMPLOYEE', 22, true, NULL),
  (4, 'pedro@absencehub.com',
      '$2b$10$Tw/.9bqeJ/YBcMDjSkZWteoU6vhO/uNECA52BRkcyeBzf9em6I4KO',
      'Pedro Sánchez',  'EMPLOYEE', 22, true, NULL),
  (5, 'laura@absencehub.com',
      '$2b$10$0Aqn33YG447NQoHJiEWRjOx8t/Xd2C2lSMTL8mNdM6NthHrVaM542',
      'Laura Fernández','EMPLOYEE', 22, true, NULL),
  (6, 'admin@absencehub.com',
      '$2b$10$ibtgrcGUOVs4hHUT29nMHuWY01mx3eucvW8DS/rw13pr2PpL5uHT2',
      'Admin Sistema',  'ADMIN',    22, true, NULL);

-- ── Equipo (con manager_id → usuario 1) ──────────────────────────────────

INSERT INTO teams (id, name, description, manager_id)
VALUES
  (1, 'Equipo de Desarrollo', 'Equipo principal de desarrollo de software', 1);

-- ── Asignar equipo a los miembros ─────────────────────────────────────────

UPDATE users SET team_id = 1 WHERE id IN (1, 2, 3, 4, 5);
-- admin (id=6) no tiene equipo asignado

-- ── Ausencias de ejemplo ──────────────────────────────────────────────────

INSERT INTO absence_requests
  (id, user_id, type, start_date, end_date, total_days, status, reason,
   manager_comment, reviewed_by, reviewed_at, created_at)
VALUES
  -- Carlos Martínez
  (1,  2, 'VACATION', '2026-06-02', '2026-06-08', 5,  'PENDING',  'Vacaciones de verano',
   NULL, NULL, NULL, NOW()),
  (2,  2, 'SICK',     '2026-04-10', '2026-04-11', 2,  'APPROVED', 'Gripe',
   NULL, 1, NOW(), NOW()),
  (3,  2, 'PERSONAL', '2026-03-15', '2026-03-15', 1,  'REJECTED', 'Mudanza',
   'Período no permitido para asuntos personales', 1, NOW(), NOW()),

  -- Ana Rodríguez
  (4,  3, 'VACATION', '2026-05-27', '2026-06-02', 5,  'APPROVED', 'Viaje a Portugal',
   NULL, 1, NOW(), NOW()),
  (5,  3, 'PERSONAL', '2026-07-04', '2026-07-04', 1,  'PENDING',  'Cita médica especialista',
   NULL, NULL, NULL, NOW()),

  -- Pedro Sánchez
  (6,  4, 'VACATION', '2026-06-09', '2026-06-13', 5,  'APPROVED', 'Vacaciones',
   NULL, 1, NOW(), NOW()),
  (7,  4, 'VACATION', '2026-07-14', '2026-07-25', 10, 'PENDING',  'Vacaciones de verano',
   NULL, NULL, NULL, NOW()),

  -- Laura Fernández
  (8,  5, 'SICK',     '2026-05-26', '2026-05-27', 2,  'APPROVED', 'Visita médica',
   NULL, 1, NOW(), NOW()),

  -- María López (manager)
  (9,  1, 'VACATION', '2026-06-16', '2026-06-20', 5,  'APPROVED', 'Vacaciones',
   NULL, 1, NOW(), NOW());

-- ── Sincronizar sequences (PostgreSQL) ───────────────────────────────────

-- Si estás en PostgreSQL y usas SERIAL / IDENTITY, sincroniza los sequences
-- para que los próximos IDs generados no colisionen con los insertados arriba.

-- SELECT setval('users_id_seq',  (SELECT MAX(id) FROM users));
-- SELECT setval('teams_id_seq',  (SELECT MAX(id) FROM teams));
-- SELECT setval('absence_requests_id_seq', (SELECT MAX(id) FROM absence_requests));

-- ── Sincronizar sequences (H2) ────────────────────────────────────────────

ALTER TABLE users ALTER COLUMN id RESTART WITH 7;
ALTER TABLE teams ALTER COLUMN id RESTART WITH 2;
ALTER TABLE absence_requests ALTER COLUMN id RESTART WITH 10;
