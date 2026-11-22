import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import { Usuario } from '../models/foro.models';
import { UsuarioService } from './usuario.service';

const CLAVE_SESION = 'foro-conecta-sesion';

// Sesion del usuario. Patron Observer: usuario$ notifica a la barra de navegacion, los guards
// y las paginas cada vez que alguien inicia o cierra sesion. Singleton: providedIn 'root'.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioService = inject(UsuarioService);
  private readonly usuarioSubject = new BehaviorSubject<Usuario | null>(this.restaurarSesion());

  readonly usuario$ = this.usuarioSubject.asObservable();
  readonly esAdmin$ = this.usuario$.pipe(map((u) => u?.rol === 'ADMIN'));

  get usuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  get estaAutenticado(): boolean {
    return this.usuarioSubject.value !== null;
  }

  get esAdmin(): boolean {
    return this.usuarioSubject.value?.rol === 'ADMIN';
  }

  // Devuelve false si el usuario o la contraseña no coinciden (mismo mensaje en ambos casos)
  login(username: string, password: string): boolean {
    const usuario = this.usuarioService.buscarPorCredenciales(username.trim(), password);
    if (!usuario) {
      return false;
    }
    this.guardarSesion(usuario);
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(CLAVE_SESION);
    this.usuarioSubject.next(null);
  }

  // Refresca los datos de la sesion despues de editar el perfil
  refrescar(): void {
    const actual = this.usuarioSubject.value;
    if (actual) {
      const usuario = this.usuarioService.obtener(actual.id);
      usuario ? this.guardarSesion(usuario) : this.logout();
    }
  }

  private guardarSesion(usuario: Usuario): void {
    sessionStorage.setItem(CLAVE_SESION, String(usuario.id));
    this.usuarioSubject.next(usuario);
  }

  private restaurarSesion(): Usuario | null {
    const id = Number(sessionStorage.getItem(CLAVE_SESION));
    return id ? (this.usuarioService.obtener(id) ?? null) : null;
  }
}
