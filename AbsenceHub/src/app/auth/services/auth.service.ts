import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';

const SESSION_KEY = 'absencehub_session';

const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', email: 'manager@absencehub.com',  password: 'manager123',  name: 'María López',     role: UserRole.Manager  },
  { id: '2', email: 'empleado@absencehub.com', password: 'empleado123', name: 'Carlos Martínez', role: UserRole.Employee },
  { id: '3', email: 'ana@absencehub.com',       password: 'ana123',      name: 'Ana Rodríguez',   role: UserRole.Employee },
  { id: '4', email: 'pedro@absencehub.com',     password: 'pedro123',    name: 'Pedro Sánchez',   role: UserRole.Employee },
  { id: '5', email: 'laura@absencehub.com',     password: 'laura123',    name: 'Laura Fernández', role: UserRole.Employee },
  { id: '6', email: 'admin@absencehub.com',     password: 'admin123',    name: 'Admin Sistema',   role: UserRole.Admin    },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private _sessionUser = signal<User | null>(this.loadSession());

  readonly currentUser     = this._sessionUser.asReadonly();
  readonly isAuthenticated = computed(() => this._sessionUser() !== null);
  readonly isManager       = computed(() => this._sessionUser()?.role === UserRole.Manager);
  readonly isAdmin         = computed(() => this._sessionUser()?.role === UserRole.Admin);

  login(email: string, password: string): Observable<boolean> {
    const match = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!match) return of(false);
    const { password: _pwd, ...user } = match;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this._sessionUser.set(user);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this._sessionUser.set(null);
    this.router.navigate(['/login']);
  }

  refreshCurrentUser(): Observable<User> {
    return of(this._sessionUser()!);
  }

  private loadSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
