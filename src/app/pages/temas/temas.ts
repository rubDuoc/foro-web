import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map, startWith } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ForoService } from '../../services/foro.service';
import { UsuarioService } from '../../services/usuario.service';

// CONTROLADOR (MVC): busqueda de temas por texto y filtro por categoria (pagina publica)
@Component({
  selector: 'app-temas',
  imports: [AsyncPipe, DatePipe, SlicePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './temas.html',
})
export class Temas {
  private readonly foro = inject(ForoService);
  private readonly router = inject(Router);
  protected readonly usuarios = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  // ?categoria= de la URL (llega como input gracias a withComponentInputBinding)
  readonly categoria = input<string>();

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly categorias$ = this.foro.categorias$;

  // Observer: la lista se recalcula al escribir, al cambiar la categoria o al cambiar los temas
  protected readonly temas$ = combineLatest([
    this.foro.temasVisibles$,
    this.busqueda.valueChanges.pipe(startWith('')),
    toObservable(this.categoria),
    this.foro.comentariosVisibles$,
  ]).pipe(
    map(([temas, texto, categoria, comentarios]) => {
      const filtro = texto.trim().toLowerCase();
      return temas
        .filter((t) => !categoria || t.categoriaId === Number(categoria))
        .filter((t) => !filtro || t.titulo.toLowerCase().includes(filtro) || t.contenido.toLowerCase().includes(filtro))
        .map((t) => ({ ...t, comentarios: comentarios.filter((c) => c.temaId === t.id).length }));
    }),
  );

  cambiarCategoria(valor: string): void {
    this.router.navigate(['/temas'], { queryParams: { categoria: valor || null } });
  }

  nombreCategoria(id: number | string | undefined): string {
    return this.foro.categoria(Number(id))?.nombre ?? '';
  }
}
