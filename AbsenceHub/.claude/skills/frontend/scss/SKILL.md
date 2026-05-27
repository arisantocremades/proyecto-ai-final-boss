---
name: scss-modern-patterns
description: Genera y revisa estilos SCSS modernos para proyectos Angular. Usar
             SIEMPRE que se creen, modifiquen o revisen archivos .scss, se añadan
             estilos a componentes, se defina theming, variables, mixins, o se
             refactorice CSS existente a SCSS. Aplicar también cuando el usuario
             pida estilos responsivos, animaciones, o sistemas de diseño en Angular.
---

# Patrones Modernos de SCSS en Angular

## Reglas generales

- Usa SCSS, nunca CSS plano
- Máximo 3 niveles de anidamiento
- Usa variables CSS (`--var`) para valores del tema y variables SCSS (`$var`) para valores internos del archivo
- Nunca uses `!important` salvo para utilidades de accesibilidad

---

## Estructura de archivos

Organiza los estilos globales en `src/styles/`:

```
src/
├── styles/
│   ├── _variables.scss     # tokens de diseño
│   ├── _mixins.scss        # mixins reutilizables
│   ├── _typography.scss    # estilos de texto
│   ├── _reset.scss         # reset/normalize
│   └── _animations.scss    # keyframes globales
├── styles.scss             # importa todo lo anterior
└── app/
    └── feature/
        └── feature.component.scss  # estilos del componente
```

`styles.scss`:
```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;
@use 'styles/reset';
@use 'styles/typography';
```

---

## Variables y tokens de diseño

```scss
// _variables.scss

// Paleta de colores
$color-primary:     #3f51b5;
$color-primary-dark:#303f9f;
$color-accent:      #ff4081;
$color-warn:        #f44336;
$color-surface:     #ffffff;
$color-background:  #fafafa;
$color-text:        #212121;
$color-text-muted:  #757575;

// Exponer como CSS custom properties (permite theming dinámico)
:root {
  --color-primary:     #{$color-primary};
  --color-accent:      #{$color-accent};
  --color-surface:     #{$color-surface};
  --color-background:  #{$color-background};
  --color-text:        #{$color-text};
  --color-text-muted:  #{$color-text-muted};

  // Espaciado (escala de 8px)
  --spacing-xs:  4px;
  --spacing-sm:  8px;
  --spacing-md:  16px;
  --spacing-lg:  24px;
  --spacing-xl:  32px;
  --spacing-2xl: 48px;

  // Tipografía
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  // Bordes y sombras
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,.12);
  --shadow-lg: 0 10px 25px rgba(0,0,0,.15);

  // Transiciones
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}
```

---

## Mixins esenciales

```scss
// _mixins.scss

// Responsive breakpoints
$breakpoints: (
  'sm':  576px,
  'md':  768px,
  'lg':  992px,
  'xl':  1200px,
  '2xl': 1400px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Flex helpers
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Truncar texto
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// Accesibilidad: ocultar visualmente pero mantener para lectores de pantalla
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Focus ring consistente
@mixin focus-ring($color: var(--color-primary)) {
  outline: 2px solid $color;
  outline-offset: 2px;
}
```

---

## Estilos de componentes Angular

Usa `:host` en lugar de selectores genéricos. Aprovecha el encapsulamiento de Angular.

```scss
// card.component.scss

:host {
  display: block;                     // ✅ define cómo se comporta el host
  container-type: inline-size;        // ✅ habilita container queries
}

.card {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  transition: box-shadow var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__header {
    @include flex-between;
    margin-bottom: var(--spacing-sm);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text);
    @include truncate(2);
  }

  &__body {
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
  }

  // ✅ Modificadores BEM
  &--featured {
    border-left: 4px solid var(--color-primary);
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// ✅ Container queries para responsividad basada en el componente
@container (min-width: 400px) {
  .card {
    padding: var(--spacing-lg);
  }
}
```

---

## Responsive design

```scss
// ✅ Mobile-first con el mixin respond-to
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);

  @include respond-to('md') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Theming oscuro

```scss
// Automático según preferencia del SO
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface:    #1e1e1e;
    --color-background: #121212;
    --color-text:       #e0e0e0;
    --color-text-muted: #9e9e9e;
  }
}

// Manual con clase en el elemento raíz
.dark-theme {
  --color-surface:    #1e1e1e;
  --color-background: #121212;
  --color-text:       #e0e0e0;
}
```

---

## Animaciones

```scss
// _animations.scss
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Respetar preferencias de accesibilidad
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Uso en componente:
```scss
.panel {
  animation: fade-in var(--transition-normal) both;
}
```

---

## Cosas a evitar

```scss
// ❌ Más de 3 niveles de anidamiento
.parent { .child { .grandchild { .great-grandchild { } } } }

// ✅ Usa BEM o extrae a selector propio
.parent__great-grandchild { }

// ❌ Valores mágicos sueltos
margin: 13px;

// ✅ Variables semánticas
margin: var(--spacing-sm);

// ❌ !important
color: red !important;

// ❌ Selectores de ID para estilos de componente
#mi-componente { }

// ❌ CSS plano en archivos .scss
.foo { color: blue; }  // sin aprovechar nada de SCSS
```
