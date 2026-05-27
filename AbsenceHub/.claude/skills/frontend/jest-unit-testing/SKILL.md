---
name: jest-unit-testing
description: Escribe, revisa y mejora tests unitarios con Jest en proyectos Angular.
             Usar SIEMPRE que el usuario pida crear tests, specs, unit tests, pruebas
             unitarias, o cuando mencione Jest, TestBed, mocks, spies, coverage, o
             quiera verificar el comportamiento de un componente, servicio, pipe,
             guard o directiva. También aplicar al refactorizar código existente que
             tenga tests, o cuando se pida aumentar la cobertura de tests.
---

# Tests Unitarios con Jest en Angular

## Configuración base

```ts
// jest.config.ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testPathPattern: ['src/.*\\.spec\\.ts$'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  coverageThresholds: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 }
  }
};
```

```ts
// setup-jest.ts
import 'jest-preset-angular/setup-jest';
```

---

## Estructura de un test

```ts
describe('NombreClase', () => {
  // 1. Declarar variables en el scope del describe
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let serviceMock: jest.Mocked<MyService>;

  // 2. Configurar antes de cada test
  beforeEach(async () => {
    serviceMock = {
      getData: jest.fn(),
      saveData: jest.fn(),
    } as jest.Mocked<MyService>;

    await TestBed.configureTestingModule({
      imports: [MyComponent],   // standalone component
      providers: [
        { provide: MyService, useValue: serviceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 3. Limpiar si hace falta
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 4. Agrupar por funcionalidad
  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('loadData()', () => {
    it('should call service and set data on success', () => {
      // Arrange
      const mockData = [{ id: 1, name: 'Item' }];
      serviceMock.getData.mockReturnValue(of(mockData));

      // Act
      component.loadData();
      fixture.detectChanges();

      // Assert
      expect(serviceMock.getData).toHaveBeenCalledOnce();
      expect(component.data()).toEqual(mockData);
    });
  });
});
```

### Patrón AAA — siempre en este orden

```ts
it('should calculate total with discount', () => {
  // Arrange — prepara el estado inicial
  component.price.set(100);
  component.discount.set(20);

  // Act — ejecuta la acción a probar
  component.applyDiscount();

  // Assert — verifica el resultado
  expect(component.total()).toBe(80);
});
```

---

## Componentes standalone (Angular 17+)

```ts
describe('UserCardComponent', () => {
  let fixture: ComponentFixture<UserCardComponent>;
  let component: UserCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]   // ✅ import directo, no declarations
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  it('should display user name', () => {
    // ✅ Signal inputs con fixture.componentRef.setInput()
    fixture.componentRef.setInput('user', { id: 1, name: 'Ana García' });
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector('[data-testid="user-name"]');
    expect(nameEl.textContent).toContain('Ana García');
  });

  it('should emit userSelected when card is clicked', () => {
    fixture.componentRef.setInput('user', { id: 1, name: 'Ana García' });
    fixture.detectChanges();

    // ✅ Capturar output con outputFromObservable o subscribe
    const emitted: User[] = [];
    component.userSelected.subscribe(u => emitted.push(u));

    fixture.nativeElement.querySelector('.card').click();

    expect(emitted).toHaveLength(1);
    expect(emitted[0].id).toBe(1);
  });
});
```

---

## Servicios

```ts
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service  = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());   // ✅ verifica que no queden requests pendientes

  it('should fetch users from API', () => {
    const mockUsers: User[] = [{ id: 1, name: 'Ana' }];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should handle 404 error gracefully', () => {
    service.getUsers().subscribe({
      next: () => fail('should have failed'),
      error: err => expect(err.status).toBe(404)
    });

    httpMock.expectOne('/api/users').flush('Not found', {
      status: 404, statusText: 'Not Found'
    });
  });
});
```

---

## Signals

```ts
describe('CounterComponent signals', () => {
  it('should increment count signal', () => {
    // Arrange
    expect(component.count()).toBe(0);

    // Act
    component.increment();

    // Assert
    expect(component.count()).toBe(1);
  });

  it('should update computed signal when dependency changes', () => {
    component.price.set(50);
    component.quantity.set(3);

    expect(component.total()).toBe(150);   // computed(() => price() * quantity())
  });
});
```

---

## Mocks y Spies

```ts
// ✅ Mock completo de un servicio
const authServiceMock: jest.Mocked<AuthService> = {
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(true),
  currentUser$: of({ id: 1, role: 'admin' })
} as any;

// ✅ Spy sobre método real (mantiene implementación)
const spy = jest.spyOn(component, 'loadData');
component.ngOnInit();
expect(spy).toHaveBeenCalledOnce();

// ✅ Spy que sobreescribe el retorno
jest.spyOn(service, 'getUser').mockResolvedValue({ id: 1, name: 'Ana' });

// ✅ Spy que lanza error
jest.spyOn(service, 'deleteUser').mockRejectedValue(new Error('Forbidden'));

// ✅ Restaurar implementación original
jest.restoreAllMocks();   // en afterEach o afterAll
```

---

## Observables y async

```ts
import { of, throwError } from 'rxjs';
import { fakeAsync, tick, flush } from '@angular/core/testing';

// ✅ Observables síncronos — usa of()
serviceMock.getData.mockReturnValue(of([{ id: 1 }]));

// ✅ fakeAsync para código con delays o timers
it('should debounce search input', fakeAsync(() => {
  component.searchTerm.set('angular');
  tick(300);   // avanza el tiempo del debounce
  flush();

  expect(serviceMock.search).toHaveBeenCalledWith('angular');
}));

// ✅ Promesas con async/await
it('should resolve user data', async () => {
  serviceMock.getUser.mockResolvedValue({ id: 1, name: 'Ana' });

  await component.loadUser(1);

  expect(component.user()).toEqual({ id: 1, name: 'Ana' });
});
```

---

## Queries de DOM

```ts
// ✅ Por data-testid (recomendado — no acopla tests al HTML)
const btn = fixture.nativeElement.querySelector('[data-testid="submit-btn"]');

// ✅ Por texto
import { screen } from '@testing-library/angular';
const heading = screen.getByText('Bienvenido');

// ✅ Por rol de accesibilidad
const submitBtn = screen.getByRole('button', { name: /guardar/i });

// ❌ Evitar — acopla al CSS
fixture.nativeElement.querySelector('.btn-primary');

// ❌ Evitar — acopla a la estructura HTML
fixture.nativeElement.querySelector('div > ul > li:first-child');
```

Añade `data-testid` en el HTML de tus componentes:
```html
<button data-testid="submit-btn" (click)="submit()">Guardar</button>
```

---

## Guards y Resolvers

```ts
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;

  beforeEach(() => {
    authServiceMock = { isAuthenticated: jest.fn() } as any;
    routerMock = { navigate: jest.fn() } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router,      useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    expect(guard.canActivate()).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    expect(guard.canActivate()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

---

## Pipes

```ts
describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;

  beforeEach(() => { pipe = new CurrencyFormatPipe(); });

  it('should format number as EUR currency', () => {
    expect(pipe.transform(1234.5, 'EUR')).toBe('1.234,50 €');
  });

  it('should return empty string for null input', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
```

---

## Matchers útiles de Jest

```ts
// Igualdad
expect(value).toBe(42);                        // ===
expect(obj).toEqual({ id: 1 });                // deep equal
expect(obj).toMatchObject({ id: 1 });          // subconjunto

// Verdad/falsedad
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Números
expect(result).toBeGreaterThan(0);
expect(result).toBeCloseTo(3.14, 2);

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain('angular');
expect(arr).toContainEqual({ id: 1 });

// Strings
expect(str).toMatch(/angular/i);
expect(str).toContain('hello');

// Funciones / mocks
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledOnce();
expect(fn).toHaveBeenCalledWith('arg1', 42);
expect(fn).toHaveBeenCalledTimes(3);
expect(fn).not.toHaveBeenCalled();

// Errores
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('mensaje de error');

// Snapshots (usar con moderación)
expect(fixture.nativeElement).toMatchSnapshot();
```

---

## Lo que NO hacer

```ts
// ❌ Test sin descripción clara
it('works', () => { ... });

// ✅ Describe el comportamiento esperado
it('should show error message when email is invalid', () => { ... });

// ❌ Múltiples asserts sin relación
it('should handle user', () => {
  expect(component.name()).toBe('Ana');
  expect(service.save).toHaveBeenCalled();
  expect(router.navigate).toHaveBeenCalled();
});

// ✅ Un concepto por test
it('should display user name after load', () => { ... });
it('should call save service on form submit', () => { ... });

// ❌ Lógica condicional en tests
it('should work', () => {
  if (condition) { expect(a).toBe(1); } else { expect(b).toBe(2); }
});

// ❌ Tests que dependen del orden de ejecución
// Cada test debe ser completamente independiente
```
