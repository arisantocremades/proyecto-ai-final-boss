---
name: primeng-components
description: Genera e integra componentes de PrimeNG v20 en proyectos Angular.
             Usar SIEMPRE que el usuario pida usar o crear componentes de PrimeNG
             como tablas, formularios, diálogos, botones, calendarios, dropdowns,
             toast, menús, datatables, charts, o cualquier componente de PrimeNG.
             También aplicar al configurar el theming, providePrimeNG, o al
             importar componentes de PrimeNG en standalone components.
---

# PrimeNG v20 en Angular

## Instalación y configuración

```bash
npm install primeng @primeuix/themes
```

### app.config.ts
```ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',  // o 'system' para automático
          cssLayer: { name: 'primeng', order: 'tailwind-base, primeng, tailwind-utilities' }
        }
      },
      ripple: true
    })
  ]
};
```

### Presets disponibles
- `Aura` — moderno y elegante (recomendado)
- `Material` — estilo Material Design
- `Lara` — clásico PrimeNG
- `Nora` — minimalista

---

## Importación de componentes

En PrimeNG v17+ todos los componentes son **standalone**. Impórtalos directamente:

```ts
// ✅ Correcto — importar solo lo necesario
import { ButtonModule }   from 'primeng/button';
import { TableModule }    from 'primeng/table';
import { DialogModule }   from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  imports: [ButtonModule, TableModule, DialogModule, InputTextModule],
  ...
})
```

---

## Botones

```html
<!-- Variantes -->
<p-button label="Guardar" icon="pi pi-save" />
<p-button label="Cancelar" severity="secondary" />
<p-button label="Eliminar" severity="danger" icon="pi pi-trash" />
<p-button label="Info"     severity="info" variant="outlined" />
<p-button label="Cargando" [loading]="isLoading" icon="pi pi-check" />

<!-- Tamaños -->
<p-button label="Pequeño" size="small" />
<p-button label="Grande"  size="large" />

<!-- Solo icono -->
<p-button icon="pi pi-search" [rounded]="true" [text]="true" />
```

```ts
import { ButtonModule } from 'primeng/button';
```

---

## DataTable

```html
<p-table
  [value]="users()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  [sortMode]="'multiple'"
  [globalFilterFields]="['name', 'email']"
  dataKey="id"
  styleClass="p-datatable-striped">

  <ng-template pTemplate="caption">
    <div class="flex justify-between items-center">
      <span class="text-xl font-bold">Usuarios</span>
      <p-iconfield>
        <p-inputicon styleClass="pi pi-search" />
        <input pInputText [(ngModel)]="searchTerm" placeholder="Buscar..." />
      </p-iconfield>
    </div>
  </ng-template>

  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="name">Nombre <p-sortIcon field="name" /></th>
      <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
      <th pSortableColumn="role">Rol <p-sortIcon field="role" /></th>
      <th>Acciones</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-user>
    <tr>
      <td>{{ user.name }}</td>
      <td>{{ user.email }}</td>
      <td><p-tag [value]="user.role" [severity]="getRoleSeverity(user.role)" /></td>
      <td>
        <p-button icon="pi pi-pencil" [text]="true" (onClick)="editUser(user)" />
        <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="deleteUser(user)" />
      </td>
    </tr>
  </ng-template>

  <ng-template pTemplate="emptymessage">
    <tr><td colspan="4" class="text-center">No se encontraron usuarios.</td></tr>
  </ng-template>
</p-table>
```

```ts
import { TableModule } from 'primeng/table';
import { TagModule }   from 'primeng/tag';
```

---

## Formularios

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">

  <!-- Input de texto -->
  <div class="flex flex-col gap-2 mb-4">
    <label for="name">Nombre</label>
    <input pInputText id="name" formControlName="name" />
    @if (form.get('name')?.invalid && form.get('name')?.touched) {
      <small class="text-red-500">El nombre es obligatorio.</small>
    }
  </div>

  <!-- Select / Dropdown -->
  <div class="flex flex-col gap-2 mb-4">
    <label for="role">Rol</label>
    <p-select
      id="role"
      formControlName="role"
      [options]="roles"
      optionLabel="label"
      optionValue="value"
      placeholder="Selecciona un rol" />
  </div>

  <!-- Multi-select -->
  <p-multiselect
    formControlName="permissions"
    [options]="permissionOptions"
    optionLabel="label"
    optionValue="value"
    placeholder="Permisos" />

  <!-- Date picker -->
  <p-datepicker
    formControlName="birthDate"
    dateFormat="dd/mm/yy"
    [showIcon]="true" />

  <!-- Toggle -->
  <div class="flex items-center gap-2">
    <p-toggleswitch formControlName="active" />
    <label>Usuario activo</label>
  </div>

  <!-- Textarea -->
  <textarea pTextarea formControlName="notes" rows="4" autoResize></textarea>

  <p-button type="submit" label="Guardar" [disabled]="form.invalid" />
</form>
```

```ts
import { InputTextModule }    from 'primeng/inputtext';
import { SelectModule }       from 'primeng/select';
import { MultiSelectModule }  from 'primeng/multiselect';
import { DatePickerModule }   from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule }     from 'primeng/textarea';
```

---

## Dialog / Modal

```html
<!-- Trigger -->
<p-button label="Abrir" (onClick)="visible = true" />

<!-- Dialog -->
<p-dialog
  header="Confirmar acción"
  [(visible)]="visible"
  [modal]="true"
  [style]="{ width: '450px' }"
  [draggable]="false">

  <p>¿Estás seguro de que quieres continuar?</p>

  <ng-template pTemplate="footer">
    <p-button label="Cancelar" severity="secondary" (onClick)="visible = false" />
    <p-button label="Confirmar" (onClick)="confirm()" />
  </ng-template>
</p-dialog>
```

```ts
import { DialogModule } from 'primeng/dialog';

// En el componente
visible = false;
```

---

## Toast y ConfirmDialog (servicios)

```ts
// app.config.ts — añadir providers
import { MessageService, ConfirmationService } from 'primeng/api';

providers: [MessageService, ConfirmationService]
```

```html
<!-- En app.component.html -->
<p-toast />
<p-confirmdialog />
```

```ts
// En cualquier componente
import { MessageService, ConfirmationService } from 'primeng/api';

private messageService    = inject(MessageService);
private confirmationService = inject(ConfirmationService);

showSuccess() {
  this.messageService.add({
    severity: 'success',
    summary: 'Guardado',
    detail: 'El registro fue guardado correctamente.',
    life: 3000
  });
}

// severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'

confirmDelete(user: User) {
  this.confirmationService.confirm({
    message: `¿Eliminar a ${user.name}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
    rejectButtonProps: { label: 'Cancelar', severity: 'secondary' },
    accept: () => this.deleteUser(user)
  });
}
```

```ts
import { ToastModule }         from 'primeng/toast';
import { ConfirmDialogModule }  from 'primeng/confirmdialog';
```

---

## Menú y navegación

```html
<!-- MenuBar -->
<p-menubar [model]="menuItems" />

<!-- ContextMenu -->
<p-contextmenu #cm [model]="contextItems" />
<p-table (onContextMenuSelect)="selectedRow = $event.data" [contextMenu]="cm">

<!-- Breadcrumb -->
<p-breadcrumb [model]="breadcrumbs" [home]="homeItem" />

<!-- Steps (wizard) -->
<p-steps [model]="steps" [(activeIndex)]="activeStep" />
```

```ts
import { MenubarModule }    from 'primeng/menubar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { StepsModule }      from 'primeng/steps';
import { MenuItem }         from 'primeng/api';

menuItems: MenuItem[] = [
  {
    label: 'Usuarios',
    icon: 'pi pi-users',
    items: [
      { label: 'Listar',  icon: 'pi pi-list',  routerLink: '/users' },
      { label: 'Crear',   icon: 'pi pi-plus',  routerLink: '/users/new' }
    ]
  }
];
```

---

## Theming personalizado

```ts
// app.config.ts — extender el preset Aura
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '{indigo.50}',
      100: '{indigo.100}',
      // ... hasta 950
      500: '{indigo.500}',
      900: '{indigo.900}',
    },
    colorScheme: {
      light: {
        surface: { 0: '#ffffff', ground: '{zinc.50}' }
      },
      dark: {
        surface: { 0: '#1a1a2e', ground: '#16213e' }
      }
    }
  }
});

providePrimeNG({ theme: { preset: MyTheme } })
```

### Dark mode toggle
```ts
import { usePreset, updatePreset } from '@primeuix/themes';

toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode');
}
```

---

## Componentes de uso frecuente — referencia rápida

| Componente     | Import desde          | Selector             |
|----------------|-----------------------|----------------------|
| Button         | primeng/button        | `<p-button>`         |
| Table          | primeng/table         | `<p-table>`          |
| Dialog         | primeng/dialog        | `<p-dialog>`         |
| Select         | primeng/select        | `<p-select>`         |
| MultiSelect    | primeng/multiselect   | `<p-multiselect>`    |
| DatePicker     | primeng/datepicker    | `<p-datepicker>`     |
| InputText      | primeng/inputtext     | `pInputText`         |
| Toast          | primeng/toast         | `<p-toast>`          |
| ConfirmDialog  | primeng/confirmdialog | `<p-confirmdialog>`  |
| Tag            | primeng/tag           | `<p-tag>`            |
| Badge          | primeng/badge         | `<p-badge>`          |
| Card           | primeng/card          | `<p-card>`           |
| Panel          | primeng/panel         | `<p-panel>`          |
| Accordion      | primeng/accordion     | `<p-accordion>`      |
| Tabs           | primeng/tabs          | `<p-tabs>`           |
| Menubar        | primeng/menubar       | `<p-menubar>`        |
| Sidebar        | primeng/drawer        | `<p-drawer>`         |
| Chart          | primeng/chart         | `<p-chart>`          |
| FileUpload     | primeng/fileupload    | `<p-fileupload>`     |
| ProgressBar    | primeng/progressbar   | `<p-progressbar>`    |
| Skeleton       | primeng/skeleton      | `<p-skeleton>`       |
| Paginator      | primeng/paginator     | `<p-paginator>`      |

---

## Lo que NO hacer

```ts
// ❌ Importar módulos completos innecesarios
import { PrimeNGConfig } from 'primeng/api';  // solo si se necesita

// ❌ Usar nombres de componentes de versiones anteriores
// p-dropdown → ahora es p-select (v17+)
// p-calendar → ahora es p-datepicker (v17+)
// p-sidebar  → ahora es p-drawer (v17+)
// p-inputSwitch → ahora es p-toggleswitch (v17+)

// ❌ Añadir providePrimeNG sin provideAnimationsAsync
// Los componentes necesitan animaciones para funcionar correctamente

// ❌ Usar ngModel sin importar FormsModule
// Si usas [(ngModel)], importa FormsModule en el componente
```
