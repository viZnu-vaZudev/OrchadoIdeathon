import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'create-idea',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ideas/create-idea/create-idea.component').then((m) => m.CreateIdeaComponent)
  },
  {
    path: 'ideas/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ideas/create-idea/create-idea.component').then((m) => m.CreateIdeaComponent)
  },
  {
    path: 'ideas/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ideas/idea-details/idea-details.component').then((m) => m.IdeaDetailsComponent)
  },
  {
    path: 'my-ideas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ideas/my-ideas/my-ideas.component').then((m) => m.MyIdeasComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
