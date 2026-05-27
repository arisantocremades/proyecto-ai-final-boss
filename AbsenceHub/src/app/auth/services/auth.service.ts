import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { TeamService } from '../../shared/services/team.service';

const MOCK_USERS: Array<User & { password: string }> = [
  { id: '1', email: 'manager@absencehub.com',  name: 'María López',    role: UserRole.Manager,  password: 'manager123' },
  { id: '2', email: 'empleado@absencehub.com', name: 'Carlos Martínez', role: UserRole.Employee, password: 'empleado123' },
  { id: '6', email: 'admin@absencehub.com',    name: 'Admin Sistema',  role: UserRole.Admin,    password: 'admin123' },
];

const SESSION_KEY = 'absencehub_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router      = inject(Router);
  private teamService = inject(TeamService);

  private _sessionUser = signal<User | null>(this.loadSession());

  readonly currentUser = computed(() => {
    const session = this._sessionUser();
    if (!session) return null;
    const member = this.teamService.getMemberById(session.id);
    return member ? { ...session, role: member.role } : session;
  });

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isManager       = computed(() => this.currentUser()?.role === UserRole.Manager);
  readonly isAdmin         = computed(() => this.currentUser()?.role === UserRole.Admin);

  login(email: string, password: string): boolean {
    const match = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!match) return false;

    const { password: _, ...user } = match;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this._sessionUser.set(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this._sessionUser.set(null);
    this.router.navigate(['/login']);
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
