import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AbsenceService } from '../shared/services/absence.service';
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
  private absence = inject(AbsenceService);

  readonly pendingRequests = computed(() =>
    this.absence.requests()
      .filter(r => r.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  // ── Reject dialog state ───────────────────────────────────────────────────
  readonly rejectDialogVisible = signal(false);
  readonly rejectComment       = signal('');
  private  selectedRejectId    = signal<string | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.absence.loadTeamAbsences().subscribe();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  approve(id: string): void {
    this.absence.approve(id).subscribe();
  }

  /** Abre el diálogo de rechazo para la solicitud indicada. */
  reject(id: string): void {
    this.selectedRejectId.set(id);
    this.rejectComment.set('');
    this.rejectDialogVisible.set(true);
  }

  /** Confirma el rechazo con el comentario introducido. */
  confirmReject(): void {
    const id      = this.selectedRejectId();
    const comment = this.rejectComment().trim();
    if (!id || !comment) return;

    this.absence.reject(id, comment).subscribe({
      next:  () => this.rejectDialogVisible.set(false),
      error: () => this.rejectDialogVisible.set(false),
    });
  }

  cancelReject(): void {
    this.rejectDialogVisible.set(false);
  }
}
