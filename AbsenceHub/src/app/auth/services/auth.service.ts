import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

// ── Shapes del backend ──────────────────────────────────────────────────────

interface ApiUserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  availableDays: number;
  team: { id: number; name: string } | null;
}

interface ApiAuthResponse {
  token: string;
  tokenType: string;
  user: ApiUserResponse;
}

// ── Claves de localStorage ───────────────────────────────────────────────────

const SESSION_KEY = 'absencehub_session';
const TOKEN_KEY   = 'absencehub_token';

// ── Helpers de mapeo ─────────────────────────────────────────────────────────

function mapApiUser(apiUser: ApiUserResponse): User {
  return {
    id:    apiUser.id.toString(),
    email: apiUser.email,
    name:  apiUser.name,
    role:  apiUser.role as UserRole,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _sessionUser = signal<User | null>(this.loadSession());

  readonly currentUser     = this._sessionUser.asReadonly();
  readonly isAuthenticated = computed(() => this._sessionUser() !== null);
  readonly isManager       = computed(() => this._sessionUser()?.role === UserRole.Manager);
  readonly isAdmin         = computed(() => this._sessionUser()?.role === UserRole.Admin);

  // ── Login ─────────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<ApiAuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          const user = mapApiUser(res.user);
          localStorage.setItem(TOKEN_KEY,   res.token);
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          this._sessionUser.set(user);
        }),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    this._sessionUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── Obtener usuario actual desde el backend ───────────────────────────────

  refreshCurrentUser(): Observable<User> {
    return this.http
      .get<ApiUserResponse>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap(apiUser => {
          const user = mapApiUser(apiUser);
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          this._sessionUser.set(user);
        }),
        map(mapApiUser),
      );
  }

  // ── Restaurar sesión desde localStorage ──────────────────────────────────

  private loadSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
