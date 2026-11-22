import { Categoria, Comentario, Moderacion, Reporte, Tema, Usuario } from '../models/foro.models';

// Datos estaticos de la aplicacion (arreglos de Angular). Son los mismos datos iniciales
// de los scripts SQL de los microservicios, para que el frontend y el backend coincidan.

export const USUARIOS: Usuario[] = [
  { id: 1, username: 'admin_foro', email: 'admin@foro.cl', password: 'Admin1234', nombre: 'Administrador Principal', rol: 'ADMIN', fechaRegistro: '2026-10-01T09:00:00' },
  { id: 2, username: 'carla_mod', email: 'carla@foro.cl', password: 'Admin1234', nombre: 'Carla Fuentes', rol: 'ADMIN', fechaRegistro: '2026-10-02T10:30:00' },
  { id: 3, username: 'maria_dev', email: 'maria@correo.cl', password: 'Usuario1234', nombre: 'Maria Gonzalez', rol: 'USUARIO', fechaRegistro: '2026-10-05T18:15:00' },
  { id: 4, username: 'juan_gamer', email: 'juan@correo.cl', password: 'Usuario1234', nombre: 'Juan Perez', rol: 'USUARIO', fechaRegistro: '2026-10-08T20:45:00' },
  { id: 5, username: 'sofia_music', email: 'sofia@correo.cl', password: 'Usuario1234', nombre: 'Sofia Rojas', rol: 'USUARIO', fechaRegistro: '2026-10-12T12:00:00' },
];

export const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Tecnologia', descripcion: 'Programacion, hardware, software y novedades tecnologicas', icono: 'bi-cpu' },
  { id: 2, nombre: 'Videojuegos', descripcion: 'Juegos, consolas, torneos y recomendaciones', icono: 'bi-controller' },
  { id: 3, nombre: 'Deportes', descripcion: 'Futbol, tenis, basquetbol y deportes en general', icono: 'bi-trophy' },
  { id: 4, nombre: 'Musica', descripcion: 'Artistas, discos, conciertos e instrumentos', icono: 'bi-music-note-beamed' },
  { id: 5, nombre: 'Cine y Series', descripcion: 'Estrenos, criticas y recomendaciones', icono: 'bi-film' },
];

export const TEMAS: Tema[] = [
  { id: 1, titulo: 'Que framework backend recomiendan en 2026?', contenido: 'Estoy entre Spring Boot y NestJS para un proyecto de microservicios. Que experiencia tienen?', usuarioId: 3, categoriaId: 1, fechaCreacion: '2026-10-20T10:00:00', baneado: false },
  { id: 2, titulo: 'Mejor juego indie del año', contenido: 'Comenten cual ha sido el juego independiente que mas los ha sorprendido este año.', usuarioId: 4, categoriaId: 2, fechaCreacion: '2026-10-21T19:30:00', baneado: false },
  { id: 3, titulo: 'Torneo de Valorant entre usuarios del foro', contenido: 'Propongo organizar un torneo 5v5 entre los usuarios. Quienes se anotan?', usuarioId: 4, categoriaId: 2, fechaCreacion: '2026-10-23T21:00:00', baneado: false },
  { id: 4, titulo: 'Analisis de la fecha del campeonato nacional', contenido: 'Que les parecieron los resultados de la ultima fecha? Quien se queda con el titulo?', usuarioId: 5, categoriaId: 3, fechaCreacion: '2026-10-24T22:15:00', baneado: false },
  { id: 5, titulo: 'Discos imperdibles de rock chileno', contenido: 'Armemos una lista con los discos de rock chileno que todos deberian escuchar.', usuarioId: 5, categoriaId: 4, fechaCreacion: '2026-10-26T17:40:00', baneado: false },
  { id: 6, titulo: 'Series para ver este fin de semana', contenido: 'Busco recomendaciones de series cortas, ojala de ciencia ficcion o suspenso.', usuarioId: 3, categoriaId: 5, fechaCreacion: '2026-10-28T20:00:00', baneado: false },
];

export const COMENTARIOS: Comentario[] = [
  { id: 1, contenido: 'Spring Boot sin duda, el ecosistema para microservicios es muy completo.', usuarioId: 4, temaId: 1, fechaCreacion: '2026-10-20T11:20:00', baneado: false },
  { id: 2, contenido: 'NestJS es mas rapido de aprender si ya sabes TypeScript.', usuarioId: 5, temaId: 1, fechaCreacion: '2026-10-20T13:05:00', baneado: false },
  { id: 3, contenido: 'Hollow Knight Silksong, por lejos.', usuarioId: 3, temaId: 2, fechaCreacion: '2026-10-21T20:10:00', baneado: false },
  { id: 4, contenido: 'Me anoto! Juego de duelista.', usuarioId: 3, temaId: 3, fechaCreacion: '2026-10-23T21:45:00', baneado: false },
  { id: 5, contenido: 'Recuerden respetar las normas del foro al organizar el torneo.', usuarioId: 1, temaId: 3, fechaCreacion: '2026-10-24T09:00:00', baneado: false },
  { id: 6, contenido: 'La Ley - Invisible y Los Tres - La Espada y la Pared.', usuarioId: 4, temaId: 5, fechaCreacion: '2026-10-26T18:30:00', baneado: false },
];

export const REPORTES: Reporte[] = [
  { id: 1, tipoContenido: 'TEMA', contenidoId: 3, usuarioId: 5, motivo: 'Parece spam: promociona un torneo con inscripcion externa', extracto: 'Torneo de Valorant entre usuarios del foro', estado: 'PENDIENTE', fechaReporte: '2026-10-25T10:00:00' },
  { id: 2, tipoContenido: 'COMENTARIO', contenidoId: 2, usuarioId: 3, motivo: 'Comentario fuera de tema', extracto: 'NestJS es mas rapido de aprender si ya sabes TypeScript.', estado: 'PENDIENTE', fechaReporte: '2026-10-25T12:30:00' },
  { id: 3, tipoContenido: 'COMENTARIO', contenidoId: 6, usuarioId: 5, motivo: 'Lenguaje ofensivo hacia otro usuario', extracto: 'La Ley - Invisible y Los Tres - La Espada y la Pared.', estado: 'DESCARTADO', fechaReporte: '2026-10-26T19:00:00', fechaResolucion: '2026-10-27T09:15:00' },
  { id: 4, tipoContenido: 'TEMA', contenidoId: 6, usuarioId: 4, motivo: 'Contenido duplicado de otro tema', extracto: 'Series para ver este fin de semana', estado: 'RESUELTO', fechaReporte: '2026-10-28T21:00:00', fechaResolucion: '2026-10-29T08:30:00' },
];

export const MODERACIONES: Moderacion[] = [
  { id: 1, tipoContenido: 'COMENTARIO', contenidoId: 6, accion: 'DESCARTAR', adminId: 2, motivo: 'El comentario no incumple las normas', reporteId: 3, fecha: '2026-10-27T09:15:00' },
  { id: 2, tipoContenido: 'TEMA', contenidoId: 6, accion: 'BANEAR', adminId: 1, motivo: 'Tema duplicado', reporteId: 4, fecha: '2026-10-29T08:30:00' },
  { id: 3, tipoContenido: 'TEMA', contenidoId: 6, accion: 'DESBANEAR', adminId: 1, motivo: 'Se revisa de nuevo: el tema tiene aportes distintos', fecha: '2026-10-29T18:00:00' },
];
