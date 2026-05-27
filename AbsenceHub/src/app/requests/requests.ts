import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/services/auth.service';
import { AbsenceService } from '../shared/services/absence.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [TranslateModule, ButtonModule, TableModule, TagModule],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests {
  private auth    = inject(AuthService);
  private absence = inject(AbsenceService);
  readonly router = inject(Router);

  readonly myRequests = computed(() => {
    const uid = this.auth.currentUser()?.id ?? '';
    return this.absence.requests()
      .filter(r => r.userId === uid)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  getTagSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'approved') return 'success';
    if (status === 'pending')  return 'warn';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
