import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/services/auth.service';
import { AbsenceService } from '../shared/services/absence.service';
import { RequestStatus } from '../shared/models/absence.model';
import { UserRole } from '../auth/models/user.model';
import { VACATION_DAYS_BY_ROLE } from '../shared/models/policy.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule, RouterLink, ButtonModule, TableModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly auth    = inject(AuthService);
  readonly absence = inject(AbsenceService);
  readonly router  = inject(Router);

  readonly user      = this.auth.currentUser;
  readonly isManager = this.auth.isManager;
  readonly firstName = computed(() => this.auth.currentUser()?.name?.split(' ')[0] ?? '');

  readonly availableDays = computed(() => {
    const user = this.auth.currentUser();
    return this.absence.getAvailableDays(user?.id ?? '');
  });

  ngOnInit(): void {
    this.absence.loadTeamAbsences().subscribe();
  }

  readonly totalVacationDays = computed(() =>
    VACATION_DAYS_BY_ROLE[this.auth.currentUser()?.role ?? UserRole.Employee] ?? 22
  );

  readonly myPending = computed(() => {
    const uid = this.auth.currentUser()?.id ?? '';
    return this.absence.requests()
      .filter(r => r.userId === uid && r.status === RequestStatus.Pending).length;
  });

  readonly myApproved = computed(() => {
    const uid = this.auth.currentUser()?.id ?? '';
    return this.absence.requests()
      .filter(r => r.userId === uid && r.status === RequestStatus.Approved).length;
  });

  readonly upcomingAbsences = computed(() => {
    const today = new Date();
    const todayStr = this.toDateStr(today);
    return this.absence.requests()
      .filter(r => r.status === RequestStatus.Approved && r.endDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8);
  });

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
