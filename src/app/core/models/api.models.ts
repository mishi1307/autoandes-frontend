export type Role = 'ADMIN' | 'ASESOR' | 'JEFE_TALLER';
export interface LoginRequest { username: string; password: string; }
export interface Session { token: string; tipo: string; expiraEnSegundos: number; username: string; nombreCompleto: string; roles: string[]; permisos: string[]; expiresAt: number; }
export interface Cliente { id:number; documento:string; nombres:string; telefono?:string; }
export interface Servicio { id:number; codigo:string; nombre:string; precio:number; duracionMin:number; activo:boolean; }
export interface ServicioRequest { codigo:string; nombre:string; precio:number; duracionMin:number; }
export interface Vehiculo { id:number; placa:string; marca:string; modelo:string; anio:number; clienteId:number; clienteNombre:string; }
export interface VehiculoRequest { placa:string; marca:string; modelo:string; anio:number; clienteId:number; }
export interface DetalleOrdenRequest { servicioId:number; cantidad:number; }
export interface OrdenRequest { vehiculoId:number; kilometraje:number; detalles:DetalleOrdenRequest[]; }
export interface DetalleOrden { servicioId:number; codigoServicio:string; nombreServicio:string; cantidad:number; precioUnitario:number; subtotal:number; }
export interface OrdenResumen { id:number; numero:string; fecha:string; placa:string; cliente:string; kilometraje:number; estado:string; total:number; }
export interface Orden extends OrdenResumen { marca:string; modelo:string; usuarioRegistro:string; motivoAnulacion?:string; detalles:DetalleOrden[]; }
export interface ReporteIngreso { codigo:string; servicio:string; cantidad:number; ingreso:number; }
export interface ApiError { status:number; mensaje:string; ruta:string; campos?:Record<string,string>; }
