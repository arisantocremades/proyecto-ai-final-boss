import { Injectable, signal, computed, inject } from '@angular/core';
import { AbsenceRequest, AbsenceType, RequestStatus } from '../models/absence.model';
import { UserRole } from '../../auth/models/user.model';
import { VACATION_DAYS_BY_ROLE } from '../models/policy.model';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/notification.model';

const MOCK_REQUESTS: AbsenceRequest[] = [
  // Carlos Martínez (id: '2') — empleado actual
  {
    id: 'r1', userId: '2', userName: 'Carlos Martínez',
    type: AbsenceType.Vacation, startDate: '2026-06-02', endDate: '2026-06-08', days: 5,
    status: RequestStatus.Pending, reason: 'Vacaciones de verano', createdAt: '2026-05-20',
  },
  {
    id: 'r2', userId: '2', userName: 'Carlos Martínez',
    type: AbsenceType.Sick, startDate: '2026-04-10', endDate: '2026-04-11', days: 2,
    status: RequestStatus.Approved, reason: 'Gripe', createdAt: '2026-04-10',
  },
  {
    id: 'r3', userId: '2', userName: 'Carlos Martínez',
    type: AbsenceType.Personal, startDate: '2026-03-15', endDate: '2026-03-15', days: 1,
    status: RequestStatus.Rejected, reason: 'Mudanza', createdAt: '2026-03-10',
  },
  // Ana Rodríguez (id: '3')
  {
    id: 'r4', userId: '3', userName: 'Ana Rodríguez',
    type: AbsenceType.Vacation, startDate: '2026-05-27', endDate: '2026-06-02', days: 5,
    status: RequestStatus.Approved, reason: 'Viaje a Portugal', createdAt: '2026-05-01',
  },
  {
    id: 'r5', userId: '3', userName: 'Ana Rodríguez',
    type: AbsenceType.Personal, startDate: '2026-07-04', endDate: '2026-07-04', days: 1,
    status: RequestStatus.Pending, reason: 'Cita médica especialista', createdAt: '2026-05-22',
  },
  // Pedro Sánchez (id: '4')
  {
    id: 'r6', userId: '4', userName: 'Pedro Sánchez',
    type: AbsenceType.Vacation, startDate: '2026-06-09', endDate: '2026-06-13', days: 5,
    status: RequestStatus.Approved, reason: 'Vacaciones', createdAt: '2026-05-15',
  },
  {
    id: 'r7', userId: '4', userName: 'Pedro Sánchez',
    type: AbsenceType.Vacation, startDate: '2026-07-14', endDate: '2026-07-25', days: 10,
    status: RequestStatus.Pending, reason: 'Vacaciones de verano', createdAt: '2026-05-23',
  },
  // Laura Fernández (id: '5')
  {
    id: 'r8', userId: '5', userName: 'Laura Fernández',
    type: AbsenceType.Sick, startDate: '2026-05-26', endDate: '2026-05-27', days: 2,
    status: RequestStatus.Approved, reason: 'Visita médica', createdAt: '2026-05-26',
  },
  // María López (id: '1') — manager
  {
    id: 'r9', userId: '1', userName: 'María López',
    type: AbsenceType.Vacation, startDate: '2026-06-16', endDate: '2026-06-20', days: 5,
    status: RequestStatus.Approved, reason: 'Vacaciones', createdAt: '2026-05-10',
  },
];

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private notifSvc = inject(NotificationService);

  private _requests = signal<AbsenceRequest[]>(MOCK_REQUESTS);

  readonly requests = this._requests.asReadonly();

  readonly pendingCount = computed(() =>
    this._requests().filter(r => r.status === RequestStatus.Pending).length
  );

  getAvailableDays(userId: string, role: UserRole = UserRole.Employee): number {
    const totalDays = VACATION_DAYS_BY_ROLE[role];
    const used = this._requests()
      .filter(r =>
        r.userId === userId &&
        r.status === RequestStatus.Approved &&
        r.type   === AbsenceType.Vacation
      )
      .reduce((sum, r) => sum + r.days, 0);
    return totalDays - used;
  }

  createRequest(data: Omit<AbsenceRequest, 'id' | 'createdAt'>): void {
    const request: AbsenceRequest = {
      ...data,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this._requests.update(list => [request, ...list]);
  }

  approve(id: string): void {
    const req = this._requests().find(r => r.id === id);
    this._requests.update(list =>
      list.map(r => r.id === id ? { ...r, status: RequestStatus.Approved } : r)
    );
    if (req) {
      this.notifSvc.push({
        userId: req.userId,
        type: NotificationType.RequestApproved,
        titleKey: 'notifications.approvedTitle',
        bodyKey: 'notifications.approvedBody',
        bodyParams: { days: req.days },
        read: false,
        requestId: id,
      });
    }
  }

  reject(id: string): void {
    const req = this._requests().find(r => r.id === id);
    this._requests.update(list =>
      list.map(r => r.id === id ? { ...r, status: RequestStatus.Rejected } : r)
    );
    if (req) {
      this.notifSvc.push({
        userId: req.userId,
        type: NotificationType.RequestRejected,
        titleKey: 'notifications.rejectedTitle',
        bodyKey: 'notifications.rejectedBody',
        bodyParams: { days: req.days },
        read: false,
        requestId: id,
      });
    }
  }
}
