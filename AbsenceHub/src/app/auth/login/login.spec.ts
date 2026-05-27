import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should show no error when fields are untouched', () => {
    expect(component.emailError).toBe('');
    expect(component.passwordError).toBe('');
  });

  it('should show required error when email is touched and empty', () => {
    component.loginForm.get('email')!.markAsTouched();
    expect(component.emailError).toContain('obligatorio');
  });

  it('should show format error for invalid email', () => {
    component.loginForm.get('email')!.setValue('notanemail');
    component.loginForm.get('email')!.markAsTouched();
    expect(component.emailError).toContain('válido');
  });

  it('should show minlength error for short password', () => {
    component.loginForm.get('password')!.setValue('123');
    component.loginForm.get('password')!.markAsTouched();
    expect(component.passwordError).toContain('6 caracteres');
  });

  it('should toggle showPassword signal', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
    component.togglePassword();
    expect(component.showPassword()).toBe(false);
  });

  it('should set loginError on invalid credentials', fakeAsync(() => {
    component.loginForm.setValue({ email: 'wrong@test.com', password: 'wrongpass' });
    component.onSubmit();
    tick(601);
    expect(component.loginError()).toBeTruthy();
  }));

  it('should clear loginError before each submit attempt', fakeAsync(() => {
    component.loginError.set('Error anterior');
    component.loginForm.setValue({ email: 'wrong@test.com', password: 'wrongpass' });
    component.onSubmit();
    expect(component.loginError()).toBe('');
    tick(601);
  }));

  it('should mark all fields touched when submitting invalid form', () => {
    component.onSubmit();
    expect(component.loginForm.get('email')!.touched).toBe(true);
    expect(component.loginForm.get('password')!.touched).toBe(true);
  });
});
