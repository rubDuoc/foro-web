import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { USUARIOS } from '../data/datos-iniciales';
import { Rol, Usuario } from '../models/foro.models';

export interface DatosUsuario {
  nombre: string;
  username: string;
  email: string;
  password?: string;
}

// MODELO (MVC): usuarios guardados en un arreglo. Observer: usuarios$ notifica cada cambio.
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly usuariosSubject = new BehaviorSubject<Usuario[]>(structuredClone(USUARIOS));
  readonly usuarios$ = this.usuariosSubject.asObservable();

  // Codigos de recuperacion de contraseña por correo (simulacion del envio de correo)
  private readonly codigos = new Map<string, string>();

  private get usuarios(): Usuario[] {
    return this.usuariosSubject.value;
  }

  obtener(id: number): Usuario | undefined {
    return this.usuarios.find((u) => u.id === id);
  }

  nombreDe(id: number): string {
    return this.obtener(id)?.username ?? 'usuario eliminado';
  }

  buscarPorCredenciales(username: string, password: string): Usuario | undefined {
    return this.usuarios.find((u) => u.username === username && u.password === password);
  }

  usernameDisponible(username: string, exceptoId?: number): boolean {
    return !this.usuarios.some((u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== exceptoId);
  }

  emailDisponible(email: string, exceptoId?: number): boolean {
    return !this.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== exceptoId);
  }

  // Registro publico: siempre con rol USUARIO
  registrar(datos: DatosUsuario): Usuario {
    this.validarUnicos(datos);
    const nuevo: Usuario = {
      id: this.siguienteId(),
      nombre: datos.nombre.trim(),
      username: datos.username.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password ?? '',
      rol: 'USUARIO',
      fechaRegistro: new Date().toISOString(),
    };
    this.usuariosSubject.next([...this.usuarios, nuevo]);
    return nuevo;
  }

  // El propio usuario edita su perfil; la contraseña solo cambia si se envia una nueva
  actualizarPerfil(id: number, datos: DatosUsuario): void {
    this.validarUnicos(datos, id);
    this.reemplazar(id, (u) => ({
      ...u,
      nombre: datos.nombre.trim(),
      username: datos.username.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password ? datos.password : u.password,
    }));
  }

  verificarPassword(id: number, password: string): boolean {
    return this.obtener(id)?.password === password;
  }

  // Solo ADMIN (lo valida el componente de administracion con el guard de rol)
  cambiarRol(id: number, rol: Rol): void {
    this.reemplazar(id, (u) => ({ ...u, rol }));
  }

  eliminar(id: number): void {
    this.usuariosSubject.next(this.usuarios.filter((u) => u.id !== id));
  }

  // Recuperar contraseña, paso 1: genera un codigo de 6 digitos para el correo (se muestra en pantalla)
  generarCodigoRecuperacion(email: string): string | null {
    const usuario = this.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!usuario) {
      return null;
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigos.set(usuario.email, codigo);
    return codigo;
  }

  // Paso 2: si el codigo coincide, se guarda la nueva contraseña
  restablecerPassword(email: string, codigo: string, nueva: string): boolean {
    const clave = email.trim().toLowerCase();
    if (this.codigos.get(clave) !== codigo.trim()) {
      return false;
    }
    this.codigos.delete(clave);
    const usuario = this.usuarios.find((u) => u.email === clave);
    if (usuario) {
      this.reemplazar(usuario.id, (u) => ({ ...u, password: nueva }));
    }
    return true;
  }

  private validarUnicos(datos: DatosUsuario, exceptoId?: number): void {
    if (!this.usernameDisponible(datos.username, exceptoId)) {
      throw new Error(`El nombre de usuario "${datos.username}" ya esta registrado`);
    }
    if (!this.emailDisponible(datos.email, exceptoId)) {
      throw new Error(`El correo "${datos.email}" ya esta registrado`);
    }
  }

  private reemplazar(id: number, cambio: (u: Usuario) => Usuario): void {
    this.usuariosSubject.next(this.usuarios.map((u) => (u.id === id ? cambio(u) : u)));
  }

  private siguienteId(): number {
    return Math.max(0, ...this.usuarios.map((u) => u.id)) + 1;
  }
}
