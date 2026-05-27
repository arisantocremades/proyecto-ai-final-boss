import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calendar } from './calendar';
import { AbsenceService } from '../shared/services/absence.service';

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
      providers: [AbsenceService],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current year and month', () => {
    const now = new Date();
    expect(component.currentYear()).toBe(now.getFullYear());
    expect(component.currentMonth()).toBe(now.getMonth());
  });

  it('should always generate 42 calendar cells (6 rows × 7 cols)', () => {
    expect(component.days().length).toBe(42);
  });

  it('should mark exactly one day as today', () => {
    const todayDays = component.days().filter(d => d.isToday);
    expect(todayDays.length).toBe(1);
    expect(todayDays[0].dayNumber).toBe(new Date().getDate());
  });

  it('should navigate to previous month', () => {
    component.currentMonth.set(6);
    component.prevMonth();
    expect(component.currentMonth()).toBe(5);
  });

  it('should navigate to next month', () => {
    component.currentMonth.set(6);
    component.nextMonth();
    expect(component.currentMonth()).toBe(7);
  });

  it('should roll back to December and previous year on prevMonth from January', () => {
    component.currentMonth.set(0);
    component.currentYear.set(2026);
    component.prevMonth();
    expect(component.currentMonth()).toBe(11);
    expect(component.currentYear()).toBe(2025);
  });

  it('should advance to January and next year on nextMonth from December', () => {
    component.currentMonth.set(11);
    component.currentYear.set(2025);
    component.nextMonth();
    expect(component.currentMonth()).toBe(0);
    expect(component.currentYear()).toBe(2026);
  });

  it('should reset to current date with goToday', () => {
    component.currentMonth.set(0);
    component.currentYear.set(2020);
    component.goToday();
    const now = new Date();
    expect(component.currentMonth()).toBe(now.getMonth());
    expect(component.currentYear()).toBe(now.getFullYear());
  });

  it('should mark absences on days within approved request range', () => {
    // r4: Ana Rodríguez vacation 2026-05-27 to 2026-06-02 (approved)
    component.currentMonth.set(4); // May
    component.currentYear.set(2026);
    const day27 = component.days().find(d => d.isCurrentMonth && d.dayNumber === 27);
    expect(day27?.absences.length).toBeGreaterThan(0);
  });
});
