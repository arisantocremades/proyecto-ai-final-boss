import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TeamService } from '../../shared/services/team.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const team = inject(TeamService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);

  // Admin with no teams can only access /team until at least one is created
  if (auth.isAdmin() && !team.hasTeams() && state.url !== '/team') {
    return router.createUrlTree(['/team']);
  }

  return true;
};

export const managerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isManager()) return true;

  return router.createUrlTree(['/dashboard']);
};
