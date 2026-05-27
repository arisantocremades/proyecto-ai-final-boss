import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AbsenceType } from '../shared/models/absence.model';

interface PolicyRow {
  typeKey:          string;
  type:             AbsenceType;
  durationKey:      string;
  legalBasis:       string;
  requiresApproval: boolean;
  accumulable:      boolean;
  maxAccumulated:   number | null;
  noteKey:          string;
}

interface PermissionRow {
  motiveKey:   string;
  durationKey: string;
}

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [TranslateModule, TableModule, TagModule],
  templateUrl: './policy.html',
  styleUrl: './policy.scss',
})
export class Policy {
  readonly rows: PolicyRow[] = [
    {
      typeKey:          'types.vacation',
      type:             AbsenceType.Vacation,
      durationKey:      'policy.duration.vacation',
      legalBasis:       'Art. 38 ET',
      requiresApproval: true,
      accumulable:      true,
      maxAccumulated:   5,
      noteKey:          'policy.note.vacation',
    },
    {
      typeKey:          'types.sick',
      type:             AbsenceType.Sick,
      durationKey:      'policy.duration.sick',
      legalBasis:       'Arts. 128–144 LGSS',
      requiresApproval: false,
      accumulable:      false,
      maxAccumulated:   null,
      noteKey:          'policy.note.sick',
    },
    {
      typeKey:          'types.personal',
      type:             AbsenceType.Personal,
      durationKey:      'policy.duration.personal',
      legalBasis:       'Art. 37.3 ET',
      requiresApproval: true,
      accumulable:      false,
      maxAccumulated:   null,
      noteKey:          'policy.note.personal',
    },
    {
      typeKey:          'types.other',
      type:             AbsenceType.Other,
      durationKey:      'policy.duration.other',
      legalBasis:       'Convenio colectivo',
      requiresApproval: true,
      accumulable:      false,
      maxAccumulated:   null,
      noteKey:          'policy.note.other',
    },
  ];

  readonly permissions: PermissionRow[] = [
    { motiveKey: 'policy.perm.marriage',   durationKey: 'policy.perm.marriageDays'   },
    { motiveKey: 'policy.perm.birth',      durationKey: 'policy.perm.birthDays'      },
    { motiveKey: 'policy.perm.death1',     durationKey: 'policy.perm.death1Days'     },
    { motiveKey: 'policy.perm.death2',     durationKey: 'policy.perm.death2Days'     },
    { motiveKey: 'policy.perm.hospital',   durationKey: 'policy.perm.hospitalDays'   },
    { motiveKey: 'policy.perm.moving',     durationKey: 'policy.perm.movingDays'     },
    { motiveKey: 'policy.perm.civic',      durationKey: 'policy.perm.civicDays'      },
    { motiveKey: 'policy.perm.medical',    durationKey: 'policy.perm.medicalDays'    },
  ];

  readonly notifEvents = [
    { icon: 'pi-send',         key: 'policy.notifSubmitted', severity: 'info'    as const },
    { icon: 'pi-check-circle', key: 'policy.notifApproved',  severity: 'success' as const },
    { icon: 'pi-times-circle', key: 'policy.notifRejected',  severity: 'danger'  as const },
    { icon: 'pi-bell',         key: 'policy.notifLowDays',   severity: 'warn'    as const },
  ];
}
