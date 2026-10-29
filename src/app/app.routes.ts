import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard } from './core/guards/auth.guards';
export const routes: Routes = [
 { path:'login', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/login.page').then(m=>m.LoginPage) },
 { path:'acceso-denegado', loadComponent:()=>import('./shared/pages/access-denied.page').then(m=>m.AccessDeniedPage) },
 { path:'no-encontrado', loadComponent:()=>import('./shared/pages/not-found.page').then(m=>m.NotFoundPage) },
 { path:'', canActivate:[authGuard], loadComponent:()=>import('./layout/main-layout').then(m=>m.MainLayout), children:[
  { path:'', pathMatch:'full', redirectTo:'inicio' },
  { path:'inicio', loadComponent:()=>import('./features/home/home.page').then(m=>m.HomePage) },
  { path:'servicios/nuevo', canActivate:[permissionGuard], data:{permission:'SERVICIO_ESCRIBIR'}, loadComponent:()=>import('./features/servicios/servicios.page').then(m=>m.ServiciosPage) },
  { path:'servicios/:id/editar', canActivate:[permissionGuard], data:{permission:'SERVICIO_ESCRIBIR'}, loadComponent:()=>import('./features/servicios/servicios.page').then(m=>m.ServiciosPage) },
  { path:'servicios', canActivate:[permissionGuard], data:{permission:'SERVICIO_LEER'}, loadComponent:()=>import('./features/servicios/servicios.page').then(m=>m.ServiciosPage) },
  { path:'vehiculos/nuevo', canActivate:[permissionGuard], data:{permission:'VEHICULO_ESCRIBIR'}, loadComponent:()=>import('./features/vehiculos/vehiculos.page').then(m=>m.VehiculosPage) },
  { path:'vehiculos/:id/editar', canActivate:[permissionGuard], data:{permission:'VEHICULO_ESCRIBIR'}, loadComponent:()=>import('./features/vehiculos/vehiculos.page').then(m=>m.VehiculosPage) },
  { path:'vehiculos', canActivate:[permissionGuard], data:{permission:'VEHICULO_LEER'}, loadComponent:()=>import('./features/vehiculos/vehiculos.page').then(m=>m.VehiculosPage) },
  { path:'clientes', canActivate:[permissionGuard], data:{permission:'VEHICULO_LEER'}, loadComponent:()=>import('./features/clientes/clientes.page').then(m=>m.ClientesPage) },
  { path:'ordenes/nueva', canActivate:[permissionGuard], data:{permission:'ORDEN_REGISTRAR'}, loadComponent:()=>import('./features/ordenes/nueva-orden.page').then(m=>m.NuevaOrdenPage) },
  { path:'ordenes/:id', canActivate:[permissionGuard], data:{permission:'ORDEN_LEER'}, loadComponent:()=>import('./features/ordenes/ordenes.page').then(m=>m.OrdenesPage) },
  { path:'ordenes', canActivate:[permissionGuard], data:{permission:'ORDEN_LEER'}, loadComponent:()=>import('./features/ordenes/ordenes.page').then(m=>m.OrdenesPage) },
  { path:'reportes', canActivate:[permissionGuard], data:{permission:'REPORTE_VER'}, loadComponent:()=>import('./features/reportes/reportes.page').then(m=>m.ReportesPage) },
  { path:'**', redirectTo:'no-encontrado' }
 ]}
];
