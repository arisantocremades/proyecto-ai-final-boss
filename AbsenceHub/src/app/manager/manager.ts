import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AbsenceService } from '../shared/services/absence.service';
import { AuthService } from '../auth/services/auth.service';
import { NotificationService } from '../shared/services/notification.service';
import { NotificationType } from '../shared/models/notification.model';
import { RequestStatus } from '../shared/models/absence.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [TranslateModule, FormsModule, ButtonModule, TableModule, TagModule, DialogModule, TextareaModule],
  templateUrl: './manager.html',
  styleUrl: './manager.scss',
})
export class Manager implements OnInit {
  private readonly absence = inject(AbsenceService);
  private readonly auth    = inject(AuthService);
  private readonly notif   = inject(NotificationService);

  readonly pendingRequests = computed(() =>
    this.absence.requests()
      .filter(r => r.status === RequestStatus.Pending)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  // ── Reject dialog state ───────────────────────────────────────────────────
  readonly rejectDialogVisible  = signal(false);
  readonly rejectComment        = signal('');
  private readonly selectedRejectId = signal<string | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const managerId = this.auth.currentUser()?.id ?? '';
    this.absence.loadTeamAbsences().subscribe(requests => {
      const notified = new Set(
        this.notif.all().filter(n => n.requestId).map(n => n.requestId!)
      );
      for (const r of requests.filter(r => r.status === RequestStatus.Pending && !notified.has(r.id))) {
        this.notif.push({
          userId:     managerId,
          type:       NotificationType.RequestSubmitted,
          titleKey:   'notifications.submittedTitle',
          bodyKey:    'notifications.submittedBody',
          bodyParams: { name: r.userName, days: r.days },
          read:       false,
          requestId:  r.id,
        });
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  approve(id: string): void {
    const req = this.absence.requests().find(r => r.id === id);
    this.absence.approve(id).subscribe({
      next: () => {
        if (req) this.notif.push({
          userId:     req.userId,
          type:       NotificationType.RequestApproved,
          titleKey:   'notifications.approvedTitle',
          bodyKey:    'notifications.approvedBody',
          bodyParams: { days: req.days },
          read:       false,
          requestId:  id,
        });
      },
    });
  }

  reject(id: string): void {
    this.selectedRejectId.set(id);
    this.rejectComment.set('');
    this.rejectDialogVisible.set(true);
  }

  confirmReject(): void {
    const id      = this.selectedRejectId();
    const comment = this.rejectComment().trim();
    if (!id || !comment) return;

    const req = this.absence.requests().find(r => r.id === id);
    this.absence.reject(id, comment).subscribe({
      next: () => {
        if (req) this.notif.push({
          userId:     req.userId,
          type:       NotificationType.RequestRejected,
          titleKey:   'notifications.rejectedTitle',
          bodyKey:    'notifications.rejectedBody',
          bodyParams: { days: req.days },
          read:       false,
          requestId:  id,
        });
        this.rejectDialogVisible.set(false);
      },
      error: () => this.rejectDialogVisible.set(false),
    });
  }

  cancelReject(): void {
    this.rejectDialogVisible.set(false);
  }
}
