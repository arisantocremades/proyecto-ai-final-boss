import { TestBed } from '@angular/core/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([], withNavigationErrorHandler(() => {})), AuthService],
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for invalid credentials', () => {
    expect(service.login('wrong@email.com', 'wrongpass')).toBe(false);
  });

  it('should not set user on failed login', () => {
    service.login('wrong@email.com', 'wrongpass');
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should return true and authenticate for valid employee credentials', () => {
    const result = service.login('empleado@absencehub.com', 'empleado123');
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.role).toBe('employee');
  });

  it('should set isManager to true for manager role', () => {
    service.login('manager@absencehub.com', 'manager123');
    expect(service.isManager()).toBe(true);
  });

  it('should set isManager to false for employee role', () => {
    service.login('empleado@absencehub.com', 'empleado123');
    expect(service.isManager()).toBe(false);
  });

  it('should persist session to localStorage on login', () => {
    service.login('empleado@absencehub.com', 'empleado123');
    expect(localStorage.getItem('absencehub_session')).not.toBeNull();
  });

  it('should not store password in session', () => {
    service.login('empleado@absencehub.com', 'empleado123');
    const session = JSON.parse(localStorage.getItem('absencehub_session')!);
    expect(session.password).toBeUndefined();
  });

  it('should clear user and localStorage on logout', () => {
    service.login('empleado@absencehub.com', 'empleado123');
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('absencehub_session')).toBeNull();
  });
});
