import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { Dashboard } from './dashboard';
import { AuthService } from '../auth/services/auth.service';
import { AbsenceService } from '../shared/services/absence.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let auth: AuthService;
  let absence: AbsenceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([], withNavigationErrorHandler(() => {})), AuthService, AbsenceService],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    absence = TestBed.inject(AbsenceService);
    auth.login('empleado@absencehub.com', 'empleado123');

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute availableDays matching absence service', () => {
    expect(component.availableDays()).toBe(absence.getAvailableDays('2'));
  });

  it('should count only current user pending requests', () => {
    const expected = absence.requests()
      .filter(r => r.userId === '2' && r.status === 'pending').length;
    expect(component.myPending()).toBe(expected);
  });

  it('should count only current user approved requests', () => {
    const expected = absence.requests()
      .filter(r => r.userId === '2' && r.status === 'approved').length;
    expect(component.myApproved()).toBe(expected);
  });

  it('should show only approved absences in upcomingAbsences', () => {
    expect(component.upcomingAbsences().every(r => r.status === 'approved')).toBe(true);
  });

  it('should sort upcomingAbsences by startDate ascending', () => {
    const dates = component.upcomingAbsences().map(r => r.startDate);
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] <= dates[i + 1]).toBe(true);
    }
  });

  it('should return isManager false for employee user', () => {
    expect(component.isManager()).toBe(false);
  });

  it('should return isManager true for manager user', async () => {
    auth.logout();
    auth.login('manager@absencehub.com', 'manager123');
    fixture.detectChanges();
    expect(component.isManager()).toBe(true);
  });

  it('should expose firstName without surname', () => {
    expect(component.firstName()).toBe('Carlos');
  });
});
