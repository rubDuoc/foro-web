import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ForoService } from '../../services/foro.service';
import { sinEspaciosVacios } from '../../validators/foro.validators';

// CONTROLADOR (MVC): publicar un tema nuevo o editar uno existente (solo el autor o un ADMIN)
@Component({
  selector: 'app-tema-form',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './tema-form.html',
})
export class TemaForm implements OnInit {
  private readonly foro = inject(ForoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // :id solo existe en la ruta /temas/:id/editar
  readonly id = input<string>();
  protected readonly categorias$ = this.foro.categorias$;
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150), sinEspaciosVacios]],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    contenido: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000), sinEspaciosVacios]],
  });

  get esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    if (!this.esEdicion) {
      return;
    }
    const tema = this.foro.tema(Number(this.id()));
    if (!tema) {
      this.error.set('El tema no existe');
    } else if (!this.foro.puedeModificar(tema.usuarioId)) {
      this.error.set('Solo el autor o un administrador puede editar este tema');
      this.form.disable();
    } else {
      this.form.setValue({ titulo: tema.titulo, categoriaId: tema.categoriaId, contenido: tema.contenido });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      const datos = this.form.getRawValue();
      const id = this.esEdicion ? Number(this.id()) : this.foro.publicarTema(datos).id;
      if (this.esEdicion) {
        this.foro.editarTema(id, datos);
      }
      this.router.navigate(['/temas', id]);
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
