import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { TipoContenido } from '../../models/foro.models';
import { AuthService } from '../../services/auth.service';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { UsuarioService } from '../../services/usuario.service';
import { sinEspaciosVacios } from '../../validators/foro.validators';

// CONTROLADOR (MVC): detalle de un tema con sus comentarios (lectura publica; comentar y reportar con sesion)
@Component({
  selector: 'app-tema-detalle',
  imports: [AsyncPipe, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './tema-detalle.html',
})
export class TemaDetalle {
  protected readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);
  protected readonly usuarios = inject(UsuarioService);
  private readonly moderacion = inject(ModeracionService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  private readonly id$ = toObservable(this.id).pipe(map(Number));

  // Observer: si el tema se edita o se banea, la vista cambia sola
  protected readonly tema$ = combineLatest([this.id$, this.foro.temasVisibles$]).pipe(
    map(([id, temas]) => temas.find((t) => t.id === id) ?? null),
  );
  protected readonly comentarios$ = this.id$.pipe(switchMap((id) => this.foro.comentariosDeTema$(id)));

  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly editandoId = signal<number | null>(null);
  protected readonly reportando = signal<{ tipo: TipoContenido; id: number } | null>(null);

  protected readonly nuevoComentario = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1000), sinEspaciosVacios],
  });
  protected readonly comentarioEditado = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1000), sinEspaciosVacios],
  });
  protected readonly motivoReporte = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10), Validators.maxLength(300), sinEspaciosVacios],
  });

  comentar(temaId: number): void {
    if (this.nuevoComentario.invalid) {
      this.nuevoComentario.markAsTouched();
      return;
    }
    this.ejecutar(() => this.foro.comentar(temaId, this.nuevoComentario.value), 'Comentario publicado');
    this.nuevoComentario.reset();
  }

  editarComentario(id: number, contenido: string): void {
    this.editandoId.set(id);
    this.comentarioEditado.setValue(contenido);
  }

  guardarComentario(id: number): void {
    if (this.comentarioEditado.invalid) {
      this.comentarioEditado.markAsTouched();
      return;
    }
    if (this.ejecutar(() => this.foro.editarComentario(id, this.comentarioEditado.value), 'Comentario actualizado')) {
      this.editandoId.set(null);
    }
  }

  eliminarComentario(id: number): void {
    if (confirm('¿Eliminar este comentario?')) {
      this.ejecutar(() => this.foro.eliminarComentario(id), 'Comentario eliminado');
    }
  }

  eliminarTema(id: number): void {
    if (confirm('¿Eliminar este tema y todos sus comentarios?')) {
      if (this.ejecutar(() => this.foro.eliminarTema(id), '')) {
        this.router.navigate(['/temas']);
      }
    }
  }

  abrirReporte(tipo: TipoContenido, id: number): void {
    this.reportando.set({ tipo, id });
    this.motivoReporte.reset();
  }

  enviarReporte(): void {
    const objetivo = this.reportando();
    if (!objetivo || this.motivoReporte.invalid) {
      this.motivoReporte.markAsTouched();
      return;
    }
    if (this.ejecutar(() => this.moderacion.reportar(objetivo.tipo, objetivo.id, this.motivoReporte.value),
      'Gracias, un administrador revisará tu reporte')) {
      this.reportando.set(null);
    }
  }

  esAutor(usuarioId: number): boolean {
    return this.auth.usuarioActual?.id === usuarioId;
  }

  // Muestra el resultado y devuelve si la operacion se pudo realizar
  private ejecutar(accion: () => void, exito: string): boolean {
    this.error.set('');
    this.mensaje.set('');
    try {
      accion();
      this.mensaje.set(exito);
      return true;
    } catch (e) {
      this.error.set((e as Error).message);
      return false;
    }
  }
}
