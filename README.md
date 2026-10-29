# AutoAndes Frontend

SPA independiente del backend AutoAndes. Se construyó con Angular 22 standalone, TypeScript y SCSS; consume la API en http://localhost:8080/api/v1.

## Requisitos

- Node.js 22.12+ o 24
- npm 11

## Iniciar

`powershell
npm install
npm start
`

Abre http://localhost:4200. Ejecuta el backend y Oracle en terminales separadas antes de iniciar sesión.

## Usuarios de práctica

Contraseña inicial para las cuentas del perfil dev: Auto2026*.

- dmin: administración completa
- sesor: servicios, vehículos y registro/consulta de órdenes
- jefe: gestión de servicios, consulta/anulación de órdenes y reportes
- inactivo: cuenta deshabilitada para validar autenticación fallida

La API base está en src/app/core/config/environment.ts. El backend permite CORS desde http://localhost:4200 por defecto.

## Módulos

- Login JWT, expiración de sesión y protección de rutas por permisos.
- Consulta/gestión de servicios y vehículos con formularios.
- Consulta de clientes (solo lectura).
- Registro de órdenes con selección de cliente/vehículo, hasta 10 servicios y cantidades 1–5.
- Consulta, detalle y anulación de órdenes de servicio.
- Reportes de ingresos por servicio con impresión.
- Manejo de errores de autenticación y acceso denegado.