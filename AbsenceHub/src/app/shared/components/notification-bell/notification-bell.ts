import { Component, inject, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AppNotification } from '../../models/notification.model';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [TranslateModule, PopoverModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBell {
  private notifSvc  = inject(NotificationService);
  private auth      = inject(AuthService);
  private translate = inject(TranslateService);

  private readonly userId = computed(() => this.auth.currentUser()?.id ?? '');

  readonly notifications = computed(() =>
    this.notifSvc.all().filter(n => n.userId === this.userId())
  );

  readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  markRead(notif: AppNotification): void {
    if (!notif.read) this.notifSvc.markRead(notif.id);
  }

  markAllRead(): void {
    this.notifSvc.markAllReadForUser(this.userId());
  }

  formatTime(isoStr: string): string {
    const date    = new Date(isoStr);
    const now     = new Date();
    const diffMs  = now.getTime() - date.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    const hours   = Math.floor(diffMs / 3_600_000);
    const days    = Math.floor(diffMs / 86_400_000);

    if (minutes < 2)  return this.translate.instant('notifications.justNow');
    if (hours   < 24) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (days    < 2)  return this.translate.instant('notifications.yesterday');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
