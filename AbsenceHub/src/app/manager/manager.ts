import { Component, inject, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AbsenceService } from '../shared/services/absence.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [TranslateModule, ButtonModule, TableModule, TagModule],
  templateUrl: './manager.html',
  styleUrl: './manager.scss',
})
export class Manager {
  private absence = inject(AbsenceService);

  readonly pendingRequests = computed(() =>
    this.absence.requests()
      .filter(r => r.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  approve(id: string): void { this.absence.approve(id); }
  reject(id: string):  void { this.absence.reject(id); }
}
