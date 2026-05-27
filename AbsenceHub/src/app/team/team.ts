import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../auth/services/auth.service';
import { TeamService } from '../shared/services/team.service';
import { AbsenceService } from '../shared/services/absence.service';
import { UserRole } from '../auth/models/user.model';
import { RequestStatus } from '../shared/models/absence.model';
import { Team, TeamMember } from '../shared/models/team.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonModule, TableModule, TagModule, DialogModule, SelectModule, InputTextModule, TextareaModule, MessageModule],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class MyTeam {
  protected readonly auth    = inject(AuthService);
  protected readonly teamSvc = inject(TeamService);
  private  readonly absence  = inject(AbsenceService);
  private  readonly translate = inject(TranslateService);
  private  readonly messageSvc = inject(MessageService);

  protected readonly UserRole = UserRole;

  readonly role   = computed(() => this.auth.currentUser()?.role);
  readonly userId = computed(() => this.auth.currentUser()?.id ?? '');

  readonly myTeam = computed(() => this.teamSvc.getTeamForUser(this.userId()));

  readonly myTeamMembers = computed(() => {
    const team = this.myTeam();
    return team ? this.teamSvc.getMembersForTeam(team.id) : [];
  });

  readonly myTeamManager = computed(() => {
    const team = this.myTeam();
    return team ? this.teamSvc.getMemberById(team.managerId) : undefined;
  });

  readonly teammates = computed(() => {
    const team = this.myTeam();
    if (!team) return [];
    return this.myTeamMembers().filter(m => m.id !== this.userId() && m.id !== team.managerId);
  });

  readonly roleOptions = [
    { label_key: 'employee', value: UserRole.Employee },
    { label_key: 'manager',  value: UserRole.Manager  },
  ];

  // ── Manager: edit team ─────────────────────────────────────────────────────
  readonly showEditTeam = signal(false);
  readonly editName     = signal('');
  readonly editDesc     = signal('');

  openEditTeam(): void {
    const team = this.myTeam();
    if (!team) return;
    this.editName.set(team.name);
    this.editDesc.set(team.description);
    this.showEditTeam.set(true);
  }

  saveTeamEdit(): void {
    const team = this.myTeam();
    if (!team || !this.editName().trim()) return;
    this.teamSvc.updateTeam(team.id, this.editName().trim(), this.editDesc().trim());
    this.showEditTeam.set(false);
  }

  // ── Manager: add member ────────────────────────────────────────────────────
  readonly showAddMember  = signal(false);
  readonly emailSearch    = signal('');
  readonly selectedUser   = signal<TeamMember | undefined>(undefined);
  readonly addMemberError = signal('');

  readonly searchResults = computed(() => {
    const team = this.myTeam();
    return this.teamSvc.searchMembers(this.emailSearch(), team?.id);
  });

  readonly showDropdown = computed(() => this.searchResults().length > 0 && !this.selectedUser());

  openAddMember(): void {
    this.emailSearch.set('');
    this.selectedUser.set(undefined);
    this.addMemberError.set('');
    this.showAddMember.set(true);
  }

  onEmailInput(value: string): void {
    this.emailSearch.set(value);
    this.selectedUser.set(undefined);
    this.addMemberError.set('');
  }

  selectUser(user: TeamMember): void {
    this.selectedUser.set(user);
    this.emailSearch.set(user.email);
  }

  confirmAddMember(): void {
    const user = this.selectedUser();
    const team = this.myTeam();
    if (!user || !team) return;
    if (user.teamId) { this.addMemberError.set('team.errorAlreadyInTeam'); return; }
    this.teamSvc.addMemberToTeam(team.id, user.id);
    this.showAddMember.set(false);
  }

  removeMember(memberId: string): void { this.teamSvc.removeMemberFromTeam(memberId); }

  changeRole(memberId: string, event: Event): void {
    const raw    = (event.target as HTMLSelectElement).value;
    const role   = raw === UserRole.Manager ? UserRole.Manager : UserRole.Employee;
    const member = this.teamSvc.getMemberById(memberId);
    this.teamSvc.changeMemberRole(memberId, role).subscribe({
      next: () => this.messageSvc.add({
        severity: 'success',
        summary:  this.translate.instant('team.roleChangedSummary'),
        detail:   this.translate.instant('team.roleChangedDetail', {
          name: member?.name ?? '',
          role: this.translate.instant('user.' + role),
        }),
        life: 3000,
      }),
      error: () => this.messageSvc.add({
        severity: 'error',
        summary:  this.translate.instant('team.roleChangedSummary'),
        detail:   this.translate.instant('team.roleChangedError') || 'Error al cambiar el rol',
        life: 3000,
      }),
    });
  }

  // ── Admin ──────────────────────────────────────────────────────────────────
  readonly allTeams = this.teamSvc.teams;

  readonly availableManagers = computed(() => {
    const managedIds = new Set(this.teamSvc.teams().map(t => t.managerId));
    return this.teamSvc.members().filter(m => m.role !== UserRole.Admin && !managedIds.has(m.id));
  });

  readonly showCreateTeam  = signal(false);
  readonly createName      = signal('');
  readonly createDesc      = signal('');
  readonly createManagerId = signal('');

  openCreateTeam(): void {
    this.createName.set(''); this.createDesc.set(''); this.createManagerId.set('');
    this.showCreateTeam.set(true);
  }

  submitCreateTeam(): void {
    if (!this.createName().trim() || !this.createManagerId()) return;
    this.teamSvc.createTeam(this.createName().trim(), this.createDesc().trim(), this.createManagerId());
    this.showCreateTeam.set(false);
  }

  readonly showReassign      = signal(false);
  readonly reassignTeamId    = signal('');
  readonly reassignManagerId = signal('');

  readonly reassignableManagers = computed(() => {
    const teamId     = this.reassignTeamId();
    const managedIds = new Set(this.teamSvc.teams().filter(t => t.id !== teamId).map(t => t.managerId));
    return this.teamSvc.members().filter(m => m.role !== UserRole.Admin && !managedIds.has(m.id));
  });

  openReassign(teamId: string): void {
    this.reassignTeamId.set(teamId);
    this.reassignManagerId.set('');
    this.showReassign.set(true);
  }

  confirmReassign(): void {
    const teamId = this.reassignTeamId();
    const mgr    = this.reassignManagerId();
    if (!teamId || !mgr) return;
    this.teamSvc.reassignManager(teamId, mgr);
    this.showReassign.set(false);
  }

  readonly deleteErrorTeamId = signal('');
  readonly deleteError       = signal('');

  deleteTeam(teamId: string): void {
    const members   = this.teamSvc.getMembersForTeam(teamId);
    const memberIds = new Set(members.map(m => m.id));
    const hasPending = this.absence.requests().some(
      r => memberIds.has(r.userId) && r.status === RequestStatus.Pending,
    );
    if (hasPending) { this.deleteErrorTeamId.set(teamId); this.deleteError.set('team.errorPendingRequests'); return; }
    this.deleteErrorTeamId.set(''); this.deleteError.set('');
    this.teamSvc.deleteTeam(teamId);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getTeamManager(team: Team): TeamMember | undefined {
    return this.teamSvc.getMemberById(team.managerId);
  }

  getMemberCount(teamId: string): number {
    return this.teamSvc.getMembersForTeam(teamId).length;
  }
}
