import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../config/environment';
export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService); const router = inject(Router);
  return next(request).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status === 401 && request.url.startsWith(environment.apiUrl) && !request.url.endsWith('/auth/login')) {
      auth.logout(false); void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    }
    return throwError(() => error);
  }));
};
