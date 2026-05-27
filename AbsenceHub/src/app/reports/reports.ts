import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AbsenceService } from '../shared/services/absence.service';
import { AuthService } from '../auth/services/auth.service';
import { ExportService } from '../shared/services/export.service';
import { AbsenceType, RequestStatus } from '../shared/models/absence.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonModule, TableModule, TagModule, SelectModule, InputTextModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private absence   = inject(AbsenceService);
  private auth      = inject(AuthService);
  private exportSvc = inject(ExportService);
  private fb        = inject(FormBuilder);

  readonly isManager     = computed(() => this.auth.isManager());
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? '');

  readonly typeKeys:   AbsenceType[]   = [AbsenceType.Vacation, AbsenceType.Sick, AbsenceType.Personal, AbsenceType.Other];
  readonly statusKeys: RequestStatus[] = [RequestStatus.Pending, RequestStatus.Approved, RequestStatus.Rejected];

  readonly allTypeOptions:   string[] = ['all', ...this.typeKeys];
  readonly allStatusOptions: string[] = ['all', ...this.statusKeys];

  readonly teamUsers = computed(() => {
    const seen = new Set<string>();
    return this.absence.requests()
      .filter(r => { if (seen.has(r.userId)) return false; seen.add(r.userId); return true; })
      .map(r => ({ id: r.userId, name: r.userName }));
  });

  readonly userSelectOptions = computed(() => [
    { id: 'all', name: '—' },
    ...this.teamUsers(),
  ]);

  readonly form = this.fb.group({
    startDate: [''],
    endDate:   [''],
    type:      ['all'],
    status:    ['all'],
    userId:    ['all'],
  });

  private readonly fv = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.value)),
  );

  readonly filteredRequests = computed(() => {
    const v = this.fv();
    if (!v?.startDate || !v?.endDate || v.endDate < v.startDate) return [];
    const uid = this.currentUserId();
    const mgr = this.isManager();

    return this.absence.requests().filter(r => {
      if (r.startDate > v.endDate! || r.endDate < v.startDate!) return false;
      if (v.type   !== 'all' && r.type   !== v.type)   return false;
      if (v.status !== 'all' && r.status !== v.status) return false;
      if (!mgr && r.userId !== uid) return false;
      if (mgr && v.userId !== 'all' && r.userId !== v.userId) return false;
      return true;
    });
  });

  readonly hasRange  = computed(() => {
    const v = this.fv();
    return !!(v?.startDate && v?.endDate && v.endDate >= v.startDate);
  });

  readonly canExport = computed(() => this.hasRange() && this.filteredRequests().length > 0);

  getTagSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'approved') return 'success';
    if (status === 'pending')  return 'warn';
    if (status === 'rejected') return 'danger';
    return 'secondary';
  }

  exportPdf(): void {
    const v = this.fv()!;
    this.exportSvc.exportPdf(this.filteredRequests(), v.startDate!, v.endDate!);
  }

  exportExcel(): void {
    const v = this.fv()!;
    this.exportSvc.exportExcel(this.filteredRequests(), v.startDate!, v.endDate!);
  }

  fmtDate(d: string): string {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
