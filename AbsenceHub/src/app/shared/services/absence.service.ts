import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AbsenceRequest, AbsenceType, RequestStatus } from '../models/absence.model';
import { environment } from '../../../environments/environment';

// ── Shapes del backend ──────────────────────────────────────────────────────

interface ApiUserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ApiAbsenceResponse {
  id: number;
  user: ApiUserSummary;
  type: string;
  startDate: string;   // 'YYYY-MM-DD'
  endDate: string;     // 'YYYY-MM-DD'
  totalDays: number;
  status: string;
  reason: string;
  managerComment: string | null;
  reviewedBy: ApiUserSummary | null;
  reviewedAt: string | null;
  createdAt: string;   // 'YYYY-MM-DDTHH:mm:ss'
}

// ── Payload de creación ───────────────────────────────────────────────────────

interface CreateAbsencePayload {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

// ── Helpers de mapeo ─────────────────────────────────────────────────────────

function mapApiAbsence(api: ApiAbsenceResponse): AbsenceRequest {
  return {
    id:        api.id.toString(),
    userId:    api.user.id.toString(),
    userName:  api.user.name,
    type:      api.type as AbsenceType,
    startDate: api.startDate,
    endDate:   api.endDate,
    days:      api.totalDays,
    status:    api.status as RequestStatus,
    reason:    api.reason,
    createdAt: api.createdAt.split('T')[0], // normaliza datetime a solo fecha
  };
}

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  private http = inject(HttpClient);

  private _requests = signal<AbsenceRequest[]>([]);

  readonly requests     = this._requests.asReadonly();
  readonly pendingCount = computed(() =>
    this._requests().filter(r => r.status === RequestStatus.Pending).length
  );

  // ── Carga inicial desde el backend ──────────────────────────────────────

  loadMyAbsences(): Observable<AbsenceRequest[]> {
    return this.http
      .get<ApiAbsenceResponse[]>(`${environment.apiUrl}/absences`)
      .pipe(
        map(list => list.map(mapApiAbsence)),
        tap(mapped => this._requests.set(mapped)),
      );
  }

  loadTeamAbsences(): Observable<AbsenceRequest[]> {
    return this.http
      .get<ApiAbsenceResponse[]>(`${environment.apiUrl}/absences/team`)
      .pipe(
        map(list => list.map(mapApiAbsence)),
        tap(mapped => this._requests.set(mapped)),
      );
  }

  // ── Calcular días disponibles (con datos ya cargados) ────────────────────

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

  // ── CRUD ─────────────────────────────────────────────────────────────────

  createRequest(payload: CreateAbsencePayload): Observable<AbsenceRequest> {
    return this.http
      .post<ApiAbsenceResponse>(`${environment.apiUrl}/absences`, payload)
      .pipe(
        tap(created => {
          const mapped = mapApiAbsence(created);
          this._requests.update(list => [mapped, ...list]);
        }),
        // devuelve el objeto ya mapeado al observable externo
      ) as unknown as Observable<AbsenceRequest>;
  }

  approve(id: string): Observable<AbsenceRequest> {
    return this.http
      .patch<ApiAbsenceResponse>(`${environment.apiUrl}/absences/${id}/approve`, {})
      .pipe(
        tap(updated => {
          const mapped = mapApiAbsence(updated);
          this._requests.update(list =>
            list.map(r => r.id === id ? mapped : r),
          );
        }),
      ) as unknown as Observable<AbsenceRequest>;
  }

  reject(id: string, managerComment: string): Observable<AbsenceRequest> {
    return this.http
      .patch<ApiAbsenceResponse>(
        `${environment.apiUrl}/absences/${id}/reject`,
        { managerComment },
      )
      .pipe(
        tap(updated => {
          const mapped = mapApiAbsence(updated);
          this._requests.update(list =>
            list.map(r => r.id === id ? mapped : r),
          );
        }),
      ) as unknown as Observable<AbsenceRequest>;
  }
}
