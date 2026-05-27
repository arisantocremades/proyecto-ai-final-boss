import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AbsenceService } from '../shared/services/absence.service';
import { LangService } from '../shared/services/lang.service';
import { AbsenceType, RequestStatus } from '../shared/models/absence.model';
import { isWeekendDate, isHolidayDate } from '../shared/utils/working-days';
import { ButtonModule } from 'primeng/button';

const USER_COLORS: Record<string, string> = {
  '1': '#8b5cf6',
  '2': '#10b981',
  '3': '#f59e0b',
  '4': '#ec4899',
  '5': '#06b6d4',
};

interface CalendarDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  absences: Array<{ name: string; color: string, absenceType: AbsenceType }>;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [TranslateModule, ButtonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  private readonly absence = inject(AbsenceService);
  private readonly lang    = inject(LangService);

  readonly today = new Date();

  ngOnInit(): void {
    this.absence.loadTeamAbsences().subscribe();
  }

  currentYear  = signal(this.today.getFullYear());
  currentMonth = signal(this.today.getMonth());

  readonly monthLabel = computed(() => {
    const locale = this.lang.current() === 'es-ES' ? 'es-ES' : 'en-US';
    return new Date(this.currentYear(), this.currentMonth())
      .toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  });

  readonly days = computed((): CalendarDay[] => {
    const year     = this.currentYear();
    const month    = this.currentMonth();
    const todayStr = this.toStr(this.today);
    const approved = this.absence.requests().filter(r => r.status === RequestStatus.Approved);

    const firstDay    = new Date(year, month, 1);
    const lastDate    = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const result: CalendarDay[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = this.toStr(d);
      result.push({ dateStr, dayNumber: d.getDate(), isCurrentMonth: false, isToday: false, isWeekend: isWeekendDate(dateStr), isHoliday: isHolidayDate(dateStr), absences: [] });
    }

    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const absences = approved
        .filter(r => r.startDate <= dateStr && r.endDate >= dateStr)
        .map(r => ({ name: r.userName.split(' ')[0], color: USER_COLORS[r.userId] ?? '#6b7280', absenceType: r.type }));
      result.push({ dateStr, dayNumber: d, isCurrentMonth: true, isToday: dateStr === todayStr, isWeekend: isWeekendDate(dateStr), isHoliday: isHolidayDate(dateStr), absences });
    }

    const trailing = 42 - result.length;
    for (let d = 1; d <= trailing; d++) {
      const date = new Date(year, month + 1, d);
      const dateStr = this.toStr(date);
      result.push({ dateStr, dayNumber: d, isCurrentMonth: false, isToday: false, isWeekend: isWeekendDate(dateStr), isHoliday: isHolidayDate(dateStr), absences: [] });
    }

    return result;
  });

  prevMonth(): void {
    if (this.currentMonth() === 0) { this.currentMonth.set(11); this.currentYear.update(y => y - 1); }
    else { this.currentMonth.update(m => m - 1); }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) { this.currentMonth.set(0); this.currentYear.update(y => y + 1); }
    else { this.currentMonth.update(m => m + 1); }
  }

  goToday(): void {
    this.currentYear.set(this.today.getFullYear());
    this.currentMonth.set(this.today.getMonth());
  }

  private toStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
