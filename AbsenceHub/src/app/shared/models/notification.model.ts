export enum NotificationType {
  RequestSubmitted = 'submitted',
  RequestApproved  = 'approved',
  RequestRejected  = 'rejected',
  DaysRunningLow   = 'days_low',
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  titleKey: string;
  bodyKey: string;
  bodyParams?: Record<string, string | number>;
  read: boolean;
  createdAt: string;
  requestId?: string;
}
