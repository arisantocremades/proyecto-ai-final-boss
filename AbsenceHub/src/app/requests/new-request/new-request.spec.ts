import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { NewRequest } from './new-request';
import { AuthService } from '../../auth/services/auth.service';
import { AbsenceService } from '../../shared/services/absence.service';

describe('NewRequest', () => {
  let component: NewRequest;
  let fixture: ComponentFixture<NewRequest>;
  let auth: AuthService;
  let absence: AbsenceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequest],
      providers: [provideRouter([], withNavigationErrorHandler(() => {})), AuthService, AbsenceService],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    absence = TestBed.inject(AbsenceService);
    auth.login('empleado@absencehub.com', 'empleado123');

    fixture = TestBed.createComponent(NewRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty dates and reason', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should return 0 calculatedDays when dates are empty', () => {
    expect(component.calculatedDays).toBe(0);
  });

  it('should return 0 calculatedDays when endDate is before startDate', () => {
    component.form.patchValue({ startDate: '2026-08-10', endDate: '2026-08-05' });
    expect(component.calculatedDays).toBe(0);
  });

  it('should compute calculatedDays correctly for a range', () => {
    component.form.patchValue({ startDate: '2026-08-01', endDate: '2026-08-05' });
    expect(component.calculatedDays).toBe(5);
  });

  it('should detect endBeforeStart', () => {
    component.form.patchValue({ startDate: '2026-08-10', endDate: '2026-08-05' });
    expect(component.endBeforeStart).toBe(true);
  });

  it('should not detect endBeforeStart when dates are valid', () => {
    component.form.patchValue({ startDate: '2026-08-01', endDate: '2026-08-05' });
    expect(component.endBeforeStart).toBe(false);
  });

  it('should add a request on valid submit', () => {
    const before = absence.requests().length;
    component.form.setValue({
      type: 'vacation',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      reason: 'Vacaciones de verano',
    });
    component.onSubmit();
    expect(absence.requests().length).toBe(before + 1);
    expect(absence.requests()[0].userId).toBe('2');
  });

  it('should mark all touched when submitting invalid form', () => {
    component.onSubmit();
    expect(component.form.get('startDate')!.touched).toBe(true);
    expect(component.form.get('endDate')!.touched).toBe(true);
    expect(component.form.get('reason')!.touched).toBe(true);
  });
});
