import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';

import { Rol, Usuario } from '../../../models/foro.models';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

// CONTROLADOR (MVC): gestion de usuarios por el administrador (cambiar rol y eliminar)
@Component({
  selector: 'app-usuarios',
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly mensaje = signal('');

  protected readonly usuarios$ = combineLatest([
    this.usuarioService.usuarios$,
    this.busqueda.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([usuarios, texto]) => {
      const filtro = texto.trim().toLowerCase();
      return usuarios.filter((u) => !filtro || u.nombre.toLowerCase().includes(filtro) || u.username.toLowerCase().includes(filtro));
    }),
  );

  esYo(usuario: Usuario): boolean {
    return usuario.id === this.auth.usuarioActual?.id;
  }

  cambiarRol(usuario: Usuario, rol: string): void {
    this.usuarioService.cambiarRol(usuario.id, rol as Rol);
    this.mensaje.set(`${usuario.username} ahora tiene rol ${rol}`);
  }

  eliminar(usuario: Usuario): void {
    if (confirm(`¿Eliminar al usuario ${usuario.username}?`)) {
      this.usuarioService.eliminar(usuario.id);
      this.mensaje.set(`Usuario ${usuario.username} eliminado`);
    }
  }
}
