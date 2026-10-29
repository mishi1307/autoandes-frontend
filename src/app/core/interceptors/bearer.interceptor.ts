import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../config/environment';
export const bearerInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthService).session();
  if (!session || !request.url.startsWith(environment.apiUrl)) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } }));
};
