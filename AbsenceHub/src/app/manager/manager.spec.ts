import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Manager } from './manager';
import { AbsenceService } from '../shared/services/absence.service';

describe('Manager', () => {
  let component: Manager;
  let fixture: ComponentFixture<Manager>;
  let absence: AbsenceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Manager],
      providers: [AbsenceService],
    }).compileComponents();

    absence = TestBed.inject(AbsenceService);
    fixture = TestBed.createComponent(Manager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show only pending requests', () => {
    expect(component.pendingRequests().every(r => r.status === 'pending')).toBe(true);
  });

  it('should sort pending requests by createdAt ascending', () => {
    const dates = component.pendingRequests().map(r => r.createdAt);
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] <= dates[i + 1]).toBe(true);
    }
  });

  it('should approve a request', () => {
    const id = component.pendingRequests()[0].id;
    component.approve(id);
    expect(absence.requests().find(r => r.id === id)?.status).toBe('approved');
  });

  it('should reject a request', () => {
    const id = component.pendingRequests()[0].id;
    component.reject(id);
    expect(absence.requests().find(r => r.id === id)?.status).toBe('rejected');
  });

  it('should decrease pendingRequests count after approval', () => {
    const before = component.pendingRequests().length;
    component.approve(component.pendingRequests()[0].id);
    expect(component.pendingRequests().length).toBe(before - 1);
  });
});
