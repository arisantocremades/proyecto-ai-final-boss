import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Requests } from './requests';
import { AuthService } from '../auth/services/auth.service';
import { AbsenceService } from '../shared/services/absence.service';

describe('Requests', () => {
  let component: Requests;
  let fixture: ComponentFixture<Requests>;
  let auth: AuthService;
  let absence: AbsenceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Requests],
      providers: [provideRouter([]), AuthService, AbsenceService],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    absence = TestBed.inject(AbsenceService);
    auth.login('empleado@absencehub.com', 'empleado123');

    fixture = TestBed.createComponent(Requests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show only requests belonging to the current user', () => {
    const all = component.myRequests();
    expect(all.every(r => r.userId === '2')).toBe(true);
  });

  it('should sort requests by createdAt descending', () => {
    const dates = component.myRequests().map(r => r.createdAt);
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] >= dates[i + 1]).toBe(true);
    }
  });

  it('should return correct typeLabel', () => {
    expect(component.typeLabel('vacation')).toBe('Vacaciones');
    expect(component.typeLabel('sick')).toBe('Baja médica');
  });

  it('should return correct statusLabel', () => {
    expect(component.statusLabel('pending')).toBe('Pendiente');
    expect(component.statusLabel('approved')).toBe('Aprobada');
    expect(component.statusLabel('rejected')).toBe('Rechazada');
  });
});
