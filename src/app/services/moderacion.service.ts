import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import { MODERACIONES, REPORTES } from '../data/datos-iniciales';
import { Moderacion, Reporte, TipoAccion, TipoContenido } from '../models/foro.models';
import { AuthService } from './auth.service';
import { ForoService } from './foro.service';

// MODELO (MVC): reportes e historial de moderacion en arreglos (igual que moderation-service).
// Observer: la cola del admin y "mis reportes" se actualizan solas al reportar o moderar.
@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly auth = inject(AuthService);
  private readonly foro = inject(ForoService);

  private readonly reportesSubject = new BehaviorSubject<Reporte[]>(structuredClone(REPORTES));
  private readonly moderacionesSubject = new BehaviorSubject<Moderacion[]>(structuredClone(MODERACIONES));

  readonly reportes$ = this.reportesSubject.asObservable();
  readonly pendientes$ = this.reportes$.pipe(map((rs) => rs.filter((r) => r.estado === 'PENDIENTE')));
  readonly historial$ = this.moderacionesSubject.asObservable().pipe(
    map((ms) => [...ms].sort((a, b) => b.fecha.localeCompare(a.fecha))),
  );

  reportesDeUsuario$(usuarioId: number) {
    return this.reportes$.pipe(map((rs) => rs.filter((r) => r.usuarioId === usuarioId)));
  }

  // Cualquier usuario reporta un tema o comentario
  reportar(tipo: TipoContenido, contenidoId: number, motivo: string): void {
    const actual = this.auth.usuarioActual;
    if (!actual) {
      throw new Error('Debes iniciar sesion para reportar');
    }
    if (!this.foro.existeVisible(tipo, contenidoId)) {
      throw new Error('El contenido no existe');
    }
    const lista = this.reportesSubject.value;
    if (lista.some((r) => r.usuarioId === actual.id && r.tipoContenido === tipo && r.contenidoId === contenidoId && r.estado === 'PENDIENTE')) {
      throw new Error('Ya reportaste este contenido y esta pendiente de revision');
    }
    this.reportesSubject.next([
      ...lista,
      {
        id: this.siguienteId(lista),
        tipoContenido: tipo,
        contenidoId,
        usuarioId: actual.id,
        motivo: motivo.trim(),
        extracto: (this.foro.textoDe(tipo, contenidoId) ?? '').slice(0, 500),
        estado: 'PENDIENTE',
        fechaReporte: new Date().toISOString(),
      },
    ]);
  }

  // Solo ADMIN: BANEAR (oculta el contenido y resuelve sus reportes), DESBANEAR o DESCARTAR un reporte
  moderar(accion: TipoAccion, tipo: TipoContenido, contenidoId: number, motivo: string, reporteId?: number): void {
    const admin = this.auth.usuarioActual;
    if (!admin || admin.rol !== 'ADMIN') {
      throw new Error('Esta operacion requiere rol ADMIN');
    }
    const ahora = new Date().toISOString();
    if (accion === 'BANEAR' || accion === 'DESBANEAR') {
      this.foro.moderar(tipo, contenidoId, accion === 'BANEAR', motivo);
    }
    this.reportesSubject.next(
      this.reportesSubject.value.map((r) => {
        const resuelveTodos = accion === 'BANEAR' && r.tipoContenido === tipo && r.contenidoId === contenidoId;
        const descartaEste = accion === 'DESCARTAR' && r.id === reporteId;
        if (r.estado === 'PENDIENTE' && (resuelveTodos || descartaEste)) {
          return { ...r, estado: accion === 'BANEAR' ? 'RESUELTO' : 'DESCARTADO', fechaResolucion: ahora };
        }
        return r;
      }),
    );
    const historial = this.moderacionesSubject.value;
    this.moderacionesSubject.next([
      ...historial,
      { id: this.siguienteId(historial), tipoContenido: tipo, contenidoId, accion, adminId: admin.id, motivo: motivo.trim(), reporteId, fecha: ahora },
    ]);
  }

  private siguienteId(lista: { id: number }[]): number {
    return Math.max(0, ...lista.map((x) => x.id)) + 1;
  }
}
