export enum AbsenceType {
  Vacation = 'vacation',
  Sick     = 'sick',
  Personal = 'personal',
  Other    = 'other',
}

export enum RequestStatus {
  Pending  = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: 'Vacaciones',
  [AbsenceType.Sick]:     'Baja médica',
  [AbsenceType.Personal]: 'Asunto personal',
  [AbsenceType.Other]:    'Otro',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.Pending]:  'Pendiente',
  [RequestStatus.Approved]: 'Aprobada',
  [RequestStatus.Rejected]: 'Rechazada',
};

export interface AbsenceRequest {
  id: string;
  userId: string;
  userName: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  reason: string;
  createdAt: string;
}
