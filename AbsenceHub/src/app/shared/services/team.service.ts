import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole } from '../../auth/models/user.model';
import { Team, TeamMember } from '../models/team.model';
import { environment } from '../../../environments/environment';

const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: 'María López',     email: 'manager@absencehub.com', role: UserRole.Manager,  teamId: 't1' },
  { id: '2', name: 'Carlos Martínez', email: 'empleado@absencehub.com', role: UserRole.Employee, teamId: 't1' },
  { id: '3', name: 'Ana Rodríguez',   email: 'ana@absencehub.com',      role: UserRole.Employee, teamId: 't1' },
  { id: '4', name: 'Pedro Sánchez',   email: 'pedro@absencehub.com',    role: UserRole.Employee, teamId: 't1' },
  { id: '5', name: 'Laura Fernández', email: 'laura@absencehub.com',    role: UserRole.Employee, teamId: 't1' },
  { id: '6', name: 'Admin Sistema',   email: 'admin@absencehub.com',    role: UserRole.Admin,    teamId: null },
  { id: '7', name: 'Javier García',   email: 'javier@absencehub.com',   role: UserRole.Employee, teamId: null },
  { id: '8', name: 'Lucía Martín',    email: 'lucia@absencehub.com',    role: UserRole.Employee, teamId: null },
  { id: '9', name: 'Roberto Díaz',    email: 'roberto@absencehub.com',  role: UserRole.Manager,  teamId: null },
];

const MOCK_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Equipo de Desarrollo',
    description: 'Equipo principal de desarrollo de software',
    managerId: '1',
  },
];

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  private readonly _teams   = signal<Team[]>(MOCK_TEAMS);
  private readonly _members = signal<TeamMember[]>(MOCK_MEMBERS);

  readonly teams    = this._teams.asReadonly();
  readonly members  = this._members.asReadonly();
  readonly hasTeams = computed(() => this._teams().length > 0);

  getTeamById(id: string): Team | undefined {
    return this._teams().find(t => t.id === id);
  }

  getMembersForTeam(teamId: string): TeamMember[] {
    return this._members().filter(m => m.teamId === teamId);
  }

  getMemberById(id: string): TeamMember | undefined {
    return this._members().find(m => m.id === id);
  }

  getTeamForUser(userId: string): Team | undefined {
    const member = this.getMemberById(userId);
    if (!member?.teamId) return undefined;
    return this.getTeamById(member.teamId);
  }

  searchMembers(query: string, excludeTeamId?: string): TeamMember[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const excludedIds = excludeTeamId
      ? new Set(this.getMembersForTeam(excludeTeamId).map(m => m.id))
      : new Set<string>();
    return this._members().filter(
      m =>
        m.role !== UserRole.Admin &&
        !excludedIds.has(m.id) &&
        (m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)),
    );
  }

  createTeam(name: string, description: string, managerId: string): void {
    const id   = `t${Date.now()}`;
    const team: Team = { id, name, description, managerId };
    this._teams.update(ts => [...ts, team]);
    this._members.update(ms =>
      ms.map(m => m.id === managerId ? { ...m, teamId: id, role: UserRole.Manager } : m),
    );
  }

  deleteTeam(teamId: string): void {
    this._teams.update(ts => ts.filter(t => t.id !== teamId));
    this._members.update(ms =>
      ms.map(m => m.teamId === teamId ? { ...m, teamId: null } : m),
    );
  }

  updateTeam(teamId: string, name: string, description: string): void {
    this._teams.update(ts =>
      ts.map(t => t.id === teamId ? { ...t, name, description } : t),
    );
  }

  addMemberToTeam(teamId: string, memberId: string): void {
    this._members.update(ms =>
      ms.map(m => m.id === memberId ? { ...m, teamId } : m),
    );
  }

  removeMemberFromTeam(memberId: string): void {
    const member = this.getMemberById(memberId);
    const teamId = member?.teamId ?? null;
    this._members.update(ms =>
      ms.map(m => m.id === memberId ? { ...m, teamId: null } : m),
    );
    if (teamId) {
      const team = this.getTeamById(teamId);
      if (team?.managerId === memberId) {
        this._teams.update(ts =>
          ts.map(t => t.id === teamId ? { ...t, managerId: '' } : t),
        );
      }
    }
  }

  changeMemberRole(memberId: string, newRole: UserRole.Employee | UserRole.Manager): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiUrl}/users/${memberId}/role`, { role: newRole })
      .pipe(tap(() =>
        this._members.update(ms => ms.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      ));
  }

  reassignManager(teamId: string, newManagerId: string): void {
    this._teams.update(ts =>
      ts.map(t => t.id === teamId ? { ...t, managerId: newManagerId } : t),
    );
    this._members.update(ms =>
      ms.map(m => m.id === newManagerId ? { ...m, role: UserRole.Manager } : m),
    );
  }
}
