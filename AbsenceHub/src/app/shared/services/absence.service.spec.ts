import { TestBed } from '@angular/core/testing';
import { AbsenceService } from './absence.service';

describe('AbsenceService', () => {
  let service: AbsenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AbsenceService] });
    service = TestBed.inject(AbsenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have mock requests on init', () => {
    expect(service.requests().length).toBeGreaterThan(0);
  });

  it('should compute pendingCount matching actual pending requests', () => {
    const pending = service.requests().filter(r => r.status === 'pending').length;
    expect(service.pendingCount()).toBe(pending);
  });

  it('should return 22 available days for user with no approved vacations', () => {
    // User '2' only has approved sick leave, not vacation
    expect(service.getAvailableDays('2')).toBe(22);
  });

  it('should deduct approved vacation days from the 22-day total', () => {
    service.createRequest({
      userId: '99', userName: 'Test User', type: 'vacation',
      startDate: '2026-08-01', endDate: '2026-08-05', days: 5,
      status: 'approved', reason: 'Test',
    });
    expect(service.getAvailableDays('99')).toBe(17);
  });

  it('should not deduct sick or personal leave from available days', () => {
    service.createRequest({
      userId: '98', userName: 'Test User', type: 'sick',
      startDate: '2026-08-01', endDate: '2026-08-02', days: 2,
      status: 'approved', reason: 'Enfermedad',
    });
    expect(service.getAvailableDays('98')).toBe(22);
  });

  it('should add new request at the top of the list', () => {
    const initial = service.requests().length;
    service.createRequest({
      userId: '2', userName: 'Carlos', type: 'personal',
      startDate: '2026-09-01', endDate: '2026-09-01', days: 1,
      status: 'pending', reason: 'Cita',
    });
    expect(service.requests().length).toBe(initial + 1);
    expect(service.requests()[0].userId).toBe('2');
  });

  it('should approve a request and change its status', () => {
    const pendingId = service.requests().find(r => r.status === 'pending')!.id;
    service.approve(pendingId);
    expect(service.requests().find(r => r.id === pendingId)?.status).toBe('approved');
  });

  it('should reject a request and change its status', () => {
    const pendingId = service.requests().find(r => r.status === 'pending')!.id;
    service.reject(pendingId);
    expect(service.requests().find(r => r.id === pendingId)?.status).toBe('rejected');
  });

  it('should decrease pendingCount after approving a request', () => {
    const before = service.pendingCount();
    const pendingId = service.requests().find(r => r.status === 'pending')!.id;
    service.approve(pendingId);
    expect(service.pendingCount()).toBe(before - 1);
  });
});
