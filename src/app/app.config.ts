import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { bearerInterceptor } from './core/interceptors/bearer.interceptor';
import { unauthorizedInterceptor } from './core/interceptors/unauthorized.interceptor';
export const appConfig: ApplicationConfig = { providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideHttpClient(withInterceptors([bearerInterceptor, unauthorizedInterceptor]))] };
