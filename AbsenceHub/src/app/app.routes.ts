import { Routes } from '@angular/router';
import { authGuard, managerGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.AppLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'calendar', loadComponent: () => import('./calendar/calendar').then(m => m.Calendar) },
      { path: 'requests', loadComponent: () => import('./requests/requests').then(m => m.Requests) },
      { path: 'requests/new', loadComponent: () => import('./requests/new-request/new-request').then(m => m.NewRequest) },
      { path: 'team',   loadComponent: () => import('./team/team').then(m => m.MyTeam) },
      { path: 'policy', loadComponent: () => import('./policy/policy').then(m => m.Policy) },
      { path: 'manager', canActivate: [managerGuard], loadComponent: () => import('./manager/manager').then(m => m.Manager) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(m => m.Reports) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
