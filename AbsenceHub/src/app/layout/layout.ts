import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/services/auth.service';
import { AbsenceService } from '../shared/services/absence.service';
import { LangService } from '../shared/services/lang.service';
import { NotificationBell } from '../shared/components/notification-bell/notification-bell';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, NotificationBell],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AppLayout {
  readonly auth    = inject(AuthService);
  readonly absence = inject(AbsenceService);
  readonly lang    = inject(LangService);

  readonly initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  });

  logout(): void {
    this.auth.logout();
  }
}
