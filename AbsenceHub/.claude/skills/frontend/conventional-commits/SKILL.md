---
name: conventional-commits
description: Genera mensajes de commit siguiendo el estándar Conventional Commits.
             Usar SIEMPRE que el usuario pida hacer un commit, redactar un mensaje
             de commit, revisar el historial de git, preparar un CHANGELOG, o cuando
             pregunte cómo describir un cambio de código. También aplicar cuando se
             haga git add, git commit, o cualquier operación de versionado.
---

# Conventional Commits

Sigue el estándar https://www.conventionalcommits.org para todos los mensajes de commit.

## Formato

```
<tipo>(<scope opcional>): <descripción corta>

<cuerpo opcional>

<footer opcional>
```

### Reglas del mensaje

- La primera línea (header) máximo **72 caracteres**
- Descripción en **imperativo presente**: "add feature" no "added feature"
- Sin punto final en el header
- Cuerpo separado del header por una línea en blanco
- Cuerpo explica el **qué y por qué**, no el cómo

---

## Tipos

| Tipo       | Cuándo usarlo                                              | Bump de versión |
|------------|------------------------------------------------------------|-----------------|
| `feat`     | Nueva funcionalidad para el usuario                        | MINOR           |
| `fix`      | Corrección de un bug                                       | PATCH           |
| `refactor` | Cambio de código sin nueva feature ni fix                  | —               |
| `style`    | Formato, espacios, comas (sin cambio de lógica)            | —               |
| `docs`     | Solo documentación                                         | —               |
| `test`     | Añadir o corregir tests                                    | —               |
| `chore`    | Tareas de mantenimiento, dependencias, config              | —               |
| `perf`     | Mejora de rendimiento                                      | PATCH           |
| `ci`       | Cambios en pipelines CI/CD                                 | —               |
| `build`    | Sistema de build, scripts, herramientas externas           | —               |
| `revert`   | Revertir un commit anterior                                | —               |

### Breaking changes → MAJOR

Añade `!` después del tipo o un footer `BREAKING CHANGE:`:

```
feat!: remove deprecated auth endpoint

BREAKING CHANGE: /api/v1/login ha sido eliminado. Usar /api/v2/auth.
```

---

## Ejemplos por situación

### Feature nueva
```
feat(auth): add OAuth2 login with Google
```

### Bug fix con contexto
```
fix(cart): correct total price calculation when applying discount

El descuento se aplicaba sobre el subtotal antes de impuestos
en lugar del total final, resultando en precios incorrectos.

Closes #234
```

### Refactor
```
refactor(user-service): replace constructor injection with inject()
```

### Estilos SCSS
```
style(card): reorder properties following BEM convention
```

### Docs
```
docs(readme): update installation steps for Angular 20
```

### Tests
```
test(auth): add unit tests for token expiry edge cases
```

### Chore / dependencias
```
chore(deps): update Angular to v20.1.0
```

### Revert
```
revert: feat(dashboard): add real-time chart updates

Reverts commit a3f5c2d. Causaba memory leaks en Safari.
```

---

## Scope

El scope es opcional pero recomendado. Usa el nombre del módulo, componente o área afectada:

```
feat(users): ...
fix(api): ...
refactor(shared/utils): ...
style(home): ...
```

---

## Workflow al hacer un commit

1. Revisa los archivos modificados con `git diff --staged`
2. Identifica el tipo según la naturaleza del cambio
3. Determina el scope si aplica
4. Redacta la descripción en imperativo y menos de 72 chars
5. Si el cambio es complejo, añade cuerpo explicando el **por qué**
6. Si cierra un issue, añade `Closes #<número>` en el footer
7. Si hay breaking change, añade `BREAKING CHANGE:` en el footer o `!` en el tipo

### Comando completo con cuerpo
```bash
git commit -m "fix(payments): handle null response from payment gateway

El gateway devuelve null en lugar de un error cuando el servicio
está en mantenimiento. Ahora se maneja explícitamente y se muestra
un mensaje amigable al usuario.

Closes #412"
```

---

## Multi-línea rápida (un solo -m por línea)
```bash
git commit \
  -m "feat(notifications): add push notification support" \
  -m "Integra Firebase Cloud Messaging para notificaciones en tiempo real." \
  -m "Closes #89"
```

---

## Lo que NO hacer

```bash
# ❌ Vago e informativo
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "cambios"
git commit -m "update"

# ❌ Pasado o gerundio
git commit -m "fixed the bug"
git commit -m "adding new component"

# ❌ Sin tipo
git commit -m "login page improvements"

# ✅ Correcto
git commit -m "fix(login): prevent duplicate form submission on slow connections"
```
