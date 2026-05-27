import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AbsenceRequest, AbsenceType, RequestStatus } from '../models/absence.model';
import { AuthService } from '../../auth/services/auth.service';

let _nextId = 20;

const MOCK_ABSENCES: AbsenceRequest[] = [
  // María López — manager (userId: '1')
  { id: '1',  userId: '1', userName: 'María López',     type: AbsenceType.Vacation, startDate: '2026-07-14', endDate: '2026-07-25', days: 10, status: RequestStatus.Approved, reason: 'Vacaciones de verano',    createdAt: '2026-06-01' },
  { id: '9',  userId: '1', userName: 'María López',     type: AbsenceType.Personal, startDate: '2026-04-03', endDate: '2026-04-03', days: 1,  status: RequestStatus.Approved, reason: 'Trámite personal',        createdAt: '2026-03-20' },
  // Carlos Martínez — employee (userId: '2')
  { id: '2',  userId: '2', userName: 'Carlos Martínez', type: AbsenceType.Vacation, startDate: '2026-06-10', endDate: '2026-06-20', days: 9,  status: RequestStatus.Pending,  reason: 'Vacaciones de verano',    createdAt: '2026-05-20' },
  { id: '3',  userId: '2', userName: 'Carlos Martínez', type: AbsenceType.Sick,     startDate: '2026-03-05', endDate: '2026-03-07', days: 3,  status: RequestStatus.Approved, reason: 'Gripe',                   createdAt: '2026-03-05' },
  // Ana Rodríguez — employee (userId: '3')
  { id: '4',  userId: '3', userName: 'Ana Rodríguez',   type: AbsenceType.Vacation, startDate: '2026-08-01', endDate: '2026-08-15', days: 11, status: RequestStatus.Approved, reason: 'Vacaciones de agosto',    createdAt: '2026-06-15' },
  { id: '10', userId: '3', userName: 'Ana Rodríguez',   type: AbsenceType.Sick,     startDate: '2026-02-10', endDate: '2026-02-12', days: 3,  status: RequestStatus.Approved, reason: 'Baja médica',             createdAt: '2026-02-10' },
  // Pedro Sánchez — employee (userId: '4')
  { id: '5',  userId: '4', userName: 'Pedro Sánchez',   type: AbsenceType.Vacation, startDate: '2026-06-01', endDate: '2026-06-05', days: 5,  status: RequestStatus.Rejected, reason: 'Viaje familiar',          createdAt: '2026-05-10' },
  { id: '8',  userId: '4', userName: 'Pedro Sánchez',   type: AbsenceType.Sick,     startDate: '2026-05-15', endDate: '2026-05-16', days: 2,  status: RequestStatus.Approved, reason: 'Revisión médica',         createdAt: '2026-05-15' },
  { id: '11', userId: '4', userName: 'Pedro Sánchez',   type: AbsenceType.Vacation, startDate: '2026-09-08', endDate: '2026-09-19', days: 10, status: RequestStatus.Pending,  reason: 'Vacaciones de septiembre', createdAt: '2026-05-25' },
  // Laura Fernández — employee (userId: '5')
  { id: '6',  userId: '5', userName: 'Laura Fernández', type: AbsenceType.Personal, startDate: '2026-06-15', endDate: '2026-06-16', days: 2,  status: RequestStatus.Pending,  reason: 'Asuntos personales',      createdAt: '2026-05-25' },
  { id: '7',  userId: '5', userName: 'Laura Fernández', type: AbsenceType.Vacation, startDate: '2026-09-01', endDate: '2026-09-12', days: 10, status: RequestStatus.Approved, reason: 'Vacaciones de septiembre', createdAt: '2026-07-01' },
];

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private readonly auth = inject(AuthService);

  private readonly _requests = signal<AbsenceRequest[]>([]);
  private _all      = [...MOCK_ABSENCES];

  readonly requests     = this._requests.asReadonly();
  readonly pendingCount = computed(() =>
    this._requests().filter(r => r.status === RequestStatus.Pending).length
  );

  loadMyAbsences(): Observable<AbsenceRequest[]> {
    const userId = this.auth.currentUser()?.id ?? '';
    const mine   = this._all.filter(r => r.userId === userId);
    this._requests.set(mine);
    return of(mine);
  }

  loadTeamAbsences(): Observable<AbsenceRequest[]> {
    const all = [...this._all];
    this._requests.set(all);
    return of(all);
  }

  getAvailableDays(userId: string, totalAllowed = 22): number {
    const used = this._requests()
      .filter(r =>
        r.userId === userId &&
        r.status === RequestStatus.Approved &&
        r.type   === AbsenceType.Vacation,
      )
      .reduce((sum, r) => sum + r.days, 0);
    return totalAllowed - used;
  }

  createRequest(payload: { type: string; startDate: string; endDate: string; reason: string }): Observable<AbsenceRequest> {
    const user  = this.auth.currentUser()!;
    const start = new Date(payload.startDate);
    const end   = new Date(payload.endDate);
    let days = 0;
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days++;
    }
    const newReq: AbsenceRequest = {
      id:        String(++_nextId),
      userId:    user.id,
      userName:  user.name,
      type:      payload.type as AbsenceType,
      startDate: payload.startDate,
      endDate:   payload.endDate,
      days,
      status:    RequestStatus.Pending,
      reason:    payload.reason,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this._all = [newReq, ...this._all];
    this._requests.update(list => [newReq, ...list]);
    return of(newReq);
  }

  approve(id: string): Observable<AbsenceRequest> {
    this._all = this._all.map(r => r.id === id ? { ...r, status: RequestStatus.Approved } : r);
    this._requests.update(list => list.map(r => r.id === id ? { ...r, status: RequestStatus.Approved } : r));
    return of(this._all.find(r => r.id === id)!);
  }

  reject(id: string, _managerComment: string): Observable<AbsenceRequest> {
    this._all = this._all.map(r => r.id === id ? { ...r, status: RequestStatus.Rejected } : r);
    this._requests.update(list => list.map(r => r.id === id ? { ...r, status: RequestStatus.Rejected } : r));
    return of(this._all.find(r => r.id === id)!);
  }
}
