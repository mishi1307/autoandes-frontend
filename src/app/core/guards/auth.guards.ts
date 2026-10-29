import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
export const authGuard: CanActivateFn = (_route, state) => { const auth=inject(AuthService); return auth.session() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }); };
export const guestGuard: CanActivateFn = () => inject(AuthService).session() ? inject(Router).createUrlTree(['/inicio']) : true;
export const permissionGuard: CanActivateFn = route => { const auth=inject(AuthService); const permission=route.data['permission'] as string; return auth.hasPermission(permission) ? true : inject(Router).createUrlTree(['/acceso-denegado']); };
