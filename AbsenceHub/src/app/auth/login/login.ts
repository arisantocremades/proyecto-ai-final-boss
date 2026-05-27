import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb        = inject(FormBuilder);
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private translate = inject(TranslateService);

  loading      = signal(false);
  loginError   = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailError(): string {
    const ctrl = this.loginForm.get('email')!;
    if (!ctrl.touched) return '';
    if (ctrl.hasError('required')) return this.translate.instant('login.errorEmailRequired');
    if (ctrl.hasError('email'))    return this.translate.instant('login.errorEmailInvalid');
    return '';
  }

  get passwordError(): string {
    const ctrl = this.loginForm.get('password')!;
    if (!ctrl.touched) return '';
    if (ctrl.hasError('required'))  return this.translate.instant('login.errorPasswordRequired');
    if (ctrl.hasError('minlength')) return this.translate.instant('login.errorPasswordMin');
    return '';
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.loginError.set('');

    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      const success = this.auth.login(email!, password!);
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.loginError.set(this.translate.instant('login.errorCredentials'));
        this.loading.set(false);
      }
    }, 600);
  }
}
