import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Blocks navigation to protected routes when there is no authenticated session.
 * This is a UX convenience only — Supabase RLS is the real authorization layer.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.init();

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
