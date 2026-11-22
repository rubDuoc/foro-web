import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { Reporte, TipoAccion, TipoContenido } from '../../../models/foro.models';
import { ForoService } from '../../../services/foro.service';
import { ModeracionService } from '../../../services/moderacion.service';
import { UsuarioService } from '../../../services/usuario.service';
import { sinEspaciosVacios } from '../../../validators/foro.validators';

type Pestana = 'cola' | 'baneados' | 'historial';

// CONTROLADOR (MVC): panel del administrador para gestionar reportes y contenido (solo ADMIN, por adminGuard)
@Component({
  selector: 'app-moderacion',
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './moderacion.html',
})
export class Moderacion {
  private readonly moderacion = inject(ModeracionService);
  private readonly foro = inject(ForoService);
  protected readonly usuarios = inject(UsuarioService);

  protected readonly pestana = signal<Pestana>('cola');
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly accionAbierta = signal<{ reporte: Reporte; accion: TipoAccion } | null>(null);

  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300), sinEspaciosVacios],
  });

  // Observer: la cola, los baneados y el historial se actualizan solos despues de cada accion
  protected readonly pendientes$ = this.moderacion.pendientes$;
  protected readonly historial$ = this.moderacion.historial$;
  protected readonly baneados$ = combineLatest([this.foro.temas$, this.foro.comentarios$]).pipe(
    map(([temas, comentarios]) => [
      ...temas.filter((t) => t.baneado).map((t) => ({ tipo: 'TEMA' as TipoContenido, id: t.id, texto: t.titulo, autorId: t.usuarioId, motivo: t.motivoBaneo })),
      ...comentarios.filter((c) => c.baneado).map((c) => ({ tipo: 'COMENTARIO' as TipoContenido, id: c.id, texto: c.contenido, autorId: c.usuarioId, motivo: c.motivoBaneo })),
    ]),
  );

  abrir(reporte: Reporte, accion: TipoAccion): void {
    this.accionAbierta.set({ reporte, accion });
    this.motivo.reset(accion === 'DESCARTAR' ? 'El contenido no incumple las normas del foro' : '');
  }

  confirmar(): void {
    const abierta = this.accionAbierta();
    if (!abierta || this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    const { reporte, accion } = abierta;
    this.ejecutar(
      () => this.moderacion.moderar(accion, reporte.tipoContenido, reporte.contenidoId, this.motivo.value, reporte.id),
      accion === 'BANEAR' ? 'Contenido baneado: ya no se muestra en el foro' : 'Reporte descartado',
    );
    this.accionAbierta.set(null);
  }

  desbanear(tipo: TipoContenido, id: number): void {
    if (confirm('¿Volver a publicar este contenido?')) {
      this.ejecutar(() => this.moderacion.moderar('DESBANEAR', tipo, id, 'Revision del administrador'), 'Contenido desbaneado');
    }
  }

  enlaceTema(tipo: TipoContenido, id: number): number | undefined {
    return tipo === 'TEMA' ? id : this.foro.temaDeComentario(id);
  }

  colorAccion(accion: TipoAccion): string {
    return accion === 'BANEAR' ? 'text-bg-danger' : accion === 'DESBANEAR' ? 'text-bg-success' : 'text-bg-secondary';
  }

  private ejecutar(accion: () => void, exito: string): void {
    this.mensaje.set('');
    this.error.set('');
    try {
      accion();
      this.mensaje.set(exito);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}
