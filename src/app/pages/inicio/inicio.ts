import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ForoService } from '../../services/foro.service';
import { UsuarioService } from '../../services/usuario.service';

// CONTROLADOR (MVC) de la portada: combina varios observables del modelo en un solo objeto para la vista
@Component({
  selector: 'app-inicio',
  imports: [AsyncPipe, DatePipe, SlicePipe, RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly foro = inject(ForoService);
  protected readonly usuarios = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  protected readonly vista$ = combineLatest([
    this.foro.resumenCategorias$,
    this.foro.temasVisibles$,
    this.foro.comentariosVisibles$,
    this.usuarios.usuarios$,
  ]).pipe(
    map(([categorias, temas, comentarios, usuarios]) => ({
      categorias,
      recientes: temas.slice(0, 4),
      totalTemas: temas.length,
      totalComentarios: comentarios.length,
      totalUsuarios: usuarios.length,
    })),
  );

  nombreCategoria(id: number): string {
    return this.foro.categoria(id)?.nombre ?? '';
  }
}
