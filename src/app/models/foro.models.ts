// MODELO (MVC): mismas entidades que los microservicios user-service, forum-service y moderation-service

export type Rol = 'USUARIO' | 'ADMIN';
export type TipoContenido = 'TEMA' | 'COMENTARIO';
export type EstadoReporte = 'PENDIENTE' | 'RESUELTO' | 'DESCARTADO';
export type TipoAccion = 'BANEAR' | 'DESBANEAR' | 'DESCARTAR';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  fechaRegistro: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string; // clase de Bootstrap Icons
}

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  usuarioId: number;
  categoriaId: number;
  fechaCreacion: string;
  baneado: boolean;
  motivoBaneo?: string;
}

export interface Comentario {
  id: number;
  contenido: string;
  usuarioId: number;
  temaId: number;
  fechaCreacion: string;
  baneado: boolean;
  motivoBaneo?: string;
}

export interface Reporte {
  id: number;
  tipoContenido: TipoContenido;
  contenidoId: number;
  usuarioId: number;
  motivo: string;
  extracto: string;
  estado: EstadoReporte;
  fechaReporte: string;
  fechaResolucion?: string;
}

export interface Moderacion {
  id: number;
  tipoContenido: TipoContenido;
  contenidoId: number;
  accion: TipoAccion;
  adminId: number;
  motivo: string;
  reporteId?: number;
  fecha: string;
}
