import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { AbsenceService } from '../../shared/services/absence.service';
import { AbsenceType, RequestStatus } from '../../shared/models/absence.model';
import { UserRole } from '../../auth/models/user.model';
import { countWorkingDays } from '../../shared/utils/working-days';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonModule, SelectModule, InputTextModule, TextareaModule, MessageModule],
  templateUrl: './new-request.html',
  styleUrl: './new-request.scss',
})
export class NewRequest implements OnDestroy {
  private fb        = inject(FormBuilder);
  private auth      = inject(AuthService);
  private absence   = inject(AbsenceService);
  readonly router   = inject(Router);
  private translate = inject(TranslateService);

  readonly minDate       = new Date().toISOString().split('T')[0];
  readonly submitError   = signal('');
  readonly availableDays = computed(() => {
    const user = this.auth.currentUser();
    return this.absence.getAvailableDays(user?.id ?? '', user?.role ?? UserRole.Employee);
  });

  readonly absenceTypeOptions = Object.values(AbsenceType);

  private errorTimer?: ReturnType<typeof setTimeout>;

  form = this.fb.group({
    type:      [AbsenceType.Vacation, Validators.required],
    startDate: ['', Validators.required],
    endDate:   ['', Validators.required],
    reason:    ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnDestroy(): void {
    clearTimeout(this.errorTimer);
  }

  get calculatedDays(): number {
    const { startDate, endDate } = this.form.value;
    return countWorkingDays(startDate ?? '', endDate ?? '');
  }

  get endBeforeStart(): boolean {
    const { startDate, endDate } = this.form.value;
    return !!(startDate && endDate && endDate < startDate);
  }

  private showError(msg: string): void {
    clearTimeout(this.errorTimer);
    this.submitError.set(msg);
    this.errorTimer = setTimeout(() => this.submitError.set(''), 5000);
  }

  dismissError(): void {
    clearTimeout(this.errorTimer);
    this.submitError.set('');
  }

  onSubmit(): void {
    if (this.form.invalid || this.endBeforeStart) {
      this.form.markAllAsTouched();
      return;
    }

    const { type, startDate, endDate, reason } = this.form.value;
    const user = this.auth.currentUser()!;
    const days = this.calculatedDays;

    if (type === AbsenceType.Vacation && days > this.availableDays()) {
      const unit = days !== 1 ? this.translate.instant('newRequest.days') : this.translate.instant('newRequest.day');
      this.showError(this.translate.instant('newRequest.errorInsufficientDays', {
        requested: days, unit, available: this.availableDays(),
        pluralAvail: this.availableDays() !== 1 ? 's' : '',
      }));
      return;
    }

    const conflict = this.absence.requests().find(
      r => r.userId    === user.id              &&
           r.status    !== RequestStatus.Rejected &&
           r.startDate <= endDate!              &&
           r.endDate   >= startDate!
    );
    if (conflict) {
      this.showError(this.translate.instant('newRequest.errorOverlap', {
        start: this.fmt(conflict.startDate), end: this.fmt(conflict.endDate),
      }));
      return;
    }

    this.absence.createRequest({
      userId: user.id, userName: user.name,
      type: type as AbsenceType, startDate: startDate!, endDate: endDate!,
      days, status: RequestStatus.Pending, reason: reason!,
    });

    this.router.navigate(['/requests']);
  }

  private fmt(d: string): string {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
