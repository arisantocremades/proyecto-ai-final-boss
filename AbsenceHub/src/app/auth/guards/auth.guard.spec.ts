import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authGuard, managerGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthService],
    });
    auth = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should allow access when user is authenticated', () => {
    auth.login('empleado@absencehub.com', 'empleado123');
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as any;
    expect(result.toString()).toContain('login');
  });
});

describe('managerGuard', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthService],
    });
    auth = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should allow access when user role is manager', () => {
    auth.login('manager@absencehub.com', 'manager123');
    const result = TestBed.runInInjectionContext(() =>
      managerGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /dashboard when user is employee', () => {
    auth.login('empleado@absencehub.com', 'empleado123');
    const result = TestBed.runInInjectionContext(() =>
      managerGuard({} as any, {} as any)
    ) as any;
    expect(result.toString()).toContain('dashboard');
  });

  it('should redirect to /dashboard when user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      managerGuard({} as any, {} as any)
    ) as any;
    expect(result.toString()).toContain('dashboard');
  });
});
