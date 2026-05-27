import { UserRole } from '../../auth/models/user.model';
import { AbsenceType } from './absence.model';

export interface AbsenceTypeRule {
  maxDays: number | null;
  requiresApproval: boolean;
  accumulable: boolean;
  maxAccumulated: number | null;
}

export type RolePolicies = Record<AbsenceType, AbsenceTypeRule>;

// 22 días laborables = mínimo legal Art. 38 ET para todos los trabajadores.
// El convenio colectivo de aplicación puede mejorar esta cifra.
export const VACATION_DAYS_BY_ROLE: Record<UserRole, number> = {
  [UserRole.Employee]: 22,
  [UserRole.Manager]:  22,
  [UserRole.Admin]:    22,
};

export const ABSENCE_POLICY: Record<UserRole, RolePolicies> = {
  [UserRole.Employee]: {
    [AbsenceType.Vacation]: { maxDays: 22,   requiresApproval: true,  accumulable: true,  maxAccumulated: 5    },
    [AbsenceType.Sick]:     { maxDays: null,  requiresApproval: false, accumulable: false, maxAccumulated: null },
    [AbsenceType.Personal]: { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
    [AbsenceType.Other]:    { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
  },
  [UserRole.Manager]: {
    [AbsenceType.Vacation]: { maxDays: 22,   requiresApproval: true,  accumulable: true,  maxAccumulated: 5    },
    [AbsenceType.Sick]:     { maxDays: null,  requiresApproval: false, accumulable: false, maxAccumulated: null },
    [AbsenceType.Personal]: { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
    [AbsenceType.Other]:    { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
  },
  [UserRole.Admin]: {
    [AbsenceType.Vacation]: { maxDays: 22,   requiresApproval: true,  accumulable: true,  maxAccumulated: 5    },
    [AbsenceType.Sick]:     { maxDays: null,  requiresApproval: false, accumulable: false, maxAccumulated: null },
    [AbsenceType.Personal]: { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
    [AbsenceType.Other]:    { maxDays: null,  requiresApproval: true,  accumulable: false, maxAccumulated: null },
  },
};
