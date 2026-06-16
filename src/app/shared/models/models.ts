export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password?: string;
  token?: string;
  avatar?: string;
}

export interface Licencia {
  id?: number;
  codigoLicencia: string;
  producto: string;
  tipo: string;
  fechaVencimiento: Date;
  cantidadUsuarios: number;
  precioTotalUSD: number;
  precioTotalPEN?: number;
  cliente: string;
  empresa: string;
  correo: string;
  notas?: string;
  fechaCreacion: Date;
  usuarioID?: number;
  moneda?: string;
}

export interface Alerta {
  id?: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  prioridad: string;
  fechaExpiracion: Date;
  leida?: boolean;
  usuarioID?: number;
  fechaCreacion?: Date;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  activo: boolean;
}