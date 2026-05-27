import { Injectable, signal } from '@angular/core';
import { AppNotification, NotificationType } from '../models/notification.model';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    userId: '2',
    type: NotificationType.RequestApproved,
    titleKey: 'notifications.approvedTitle',
    bodyKey: 'notifications.approvedBody',
    bodyParams: { days: 2 },
    read: true,
    createdAt: '2026-04-11T10:00:00.000Z',
    requestId: 'r2',
  },
  {
    id: 'n2',
    userId: '2',
    type: NotificationType.DaysRunningLow,
    titleKey: 'notifications.daysLowTitle',
    bodyKey: 'notifications.daysLowBody',
    bodyParams: { days: 4 },
    read: false,
    createdAt: '2026-05-20T09:00:00.000Z',
  },
  {
    id: 'n3',
    userId: '1',
    type: NotificationType.RequestSubmitted,
    titleKey: 'notifications.submittedTitle',
    bodyKey: 'notifications.submittedBody',
    bodyParams: { name: 'Carlos Martínez', days: 5 },
    read: false,
    createdAt: '2026-05-20T08:30:00.000Z',
    requestId: 'r1',
  },
  {
    id: 'n4',
    userId: '1',
    type: NotificationType.RequestSubmitted,
    titleKey: 'notifications.submittedTitle',
    bodyKey: 'notifications.submittedBody',
    bodyParams: { name: 'Pedro Sánchez', days: 10 },
    read: true,
    createdAt: '2026-05-23T11:15:00.000Z',
    requestId: 'r7',
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _list = signal<AppNotification[]>(MOCK_NOTIFICATIONS);

  readonly all = this._list.asReadonly();

  push(n: Omit<AppNotification, 'id' | 'createdAt'>): void {
    this._list.update(list => [{
      ...n,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }, ...list]);
  }

  markRead(id: string): void {
    this._list.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllReadForUser(userId: string): void {
    this._list.update(list =>
      list.map(n => n.userId === userId ? { ...n, read: true } : n)
    );
  }
}
