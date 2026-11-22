import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Categoria } from '../../../models/foro.models';
import { ForoService } from '../../../services/foro.service';
import { sinEspaciosVacios } from '../../../validators/foro.validators';

// CONTROLADOR (MVC): gestion de categorias (solo ADMIN, igual que en forum-service)
@Component({
  selector: 'app-categorias',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './categorias.html',
})
export class Categorias {
  private readonly foro = inject(ForoService);
  private readonly fb = inject(FormBuilder);

  protected readonly categorias$ = this.foro.resumenCategorias$;
  protected readonly editandoId = signal<number | null>(null);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected readonly iconos = ['bi-cpu', 'bi-controller', 'bi-trophy', 'bi-music-note-beamed', 'bi-film', 'bi-book', 'bi-camera', 'bi-globe'];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), sinEspaciosVacios]],
    descripcion: ['', [Validators.maxLength(255)]],
    icono: ['bi-book', [Validators.required]],
  });

  editar(categoria: Categoria): void {
    this.editandoId.set(categoria.id);
    this.form.setValue({ nombre: categoria.nombre, descripcion: categoria.descripcion, icono: categoria.icono });
  }

  cancelar(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ejecutar(() => this.foro.guardarCategoria(this.form.getRawValue(), this.editandoId() ?? undefined),
      this.editandoId() ? 'Categoría actualizada' : 'Categoría creada');
    if (!this.error()) {
      this.cancelar();
    }
  }

  eliminar(categoria: Categoria): void {
    if (confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) {
      this.ejecutar(() => this.foro.eliminarCategoria(categoria.id), 'Categoría eliminada');
    }
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
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
