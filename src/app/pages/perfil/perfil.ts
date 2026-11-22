import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PasswordReglas } from '../../layout/password-reglas';
import { AuthService } from '../../services/auth.service';
import { ForoService } from '../../services/foro.service';
import { ModeracionService } from '../../services/moderacion.service';
import { UsuarioService } from '../../services/usuario.service';
import { camposIguales, passwordSegura, sinEspaciosVacios, soloLetras } from '../../validators/foro.validators';

// CONTROLADOR (MVC): modificacion del perfil propio (igual que en user-service, cada uno edita solo el suyo)
@Component({
  selector: 'app-perfil',
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule, RouterLink, PasswordReglas],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly usuarios = inject(UsuarioService);
  protected readonly foro = inject(ForoService);
  private readonly moderacion = inject(ModeracionService);
  private readonly fb = inject(FormBuilder);

  private readonly yo = this.auth.usuarioActual!;
  protected readonly misTemas$ = this.foro.temasDeUsuario$(this.yo.id);
  protected readonly misReportes$ = this.moderacion.reportesDeUsuario$(this.yo.id);

  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly mensajePassword = signal('');
  protected readonly errorPassword = signal('');

  private readonly usernameLibre = (c: AbstractControl): ValidationErrors | null =>
    c.value && !this.usuarios.usernameDisponible(c.value, this.yo.id) ? { ocupado: true } : null;
  private readonly emailLibre = (c: AbstractControl): ValidationErrors | null =>
    c.value && !this.usuarios.emailDisponible(c.value, this.yo.id) ? { ocupado: true } : null;

  protected readonly datos = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), soloLetras, sinEspaciosVacios]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_]+$/), this.usernameLibre]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150), this.emailLibre]],
  });

  protected readonly clave = this.fb.nonNullable.group(
    {
      actual: ['', [Validators.required]],
      nueva: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: camposIguales('nueva', 'confirmar') },
  );

  ngOnInit(): void {
    const { nombre, username, email } = this.auth.usuarioActual!;
    this.datos.setValue({ nombre, username, email });
  }

  guardarDatos(): void {
    this.mensaje.set('');
    this.error.set('');
    if (this.datos.invalid) {
      this.datos.markAllAsTouched();
      return;
    }
    try {
      this.usuarios.actualizarPerfil(this.yo.id, this.datos.getRawValue());
      this.auth.refrescar();
      this.mensaje.set('Datos del perfil actualizados');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }

  cambiarPassword(): void {
    this.mensajePassword.set('');
    this.errorPassword.set('');
    if (this.clave.invalid) {
      this.clave.markAllAsTouched();
      return;
    }
    const { actual, nueva } = this.clave.getRawValue();
    if (!this.usuarios.verificarPassword(this.yo.id, actual)) {
      this.errorPassword.set('La contraseña actual no es correcta');
      return;
    }
    const usuario = this.auth.usuarioActual!;
    this.usuarios.actualizarPerfil(this.yo.id, { ...usuario, password: nueva });
    this.clave.reset();
    this.mensajePassword.set('Contraseña actualizada');
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  invalido(grupo: 'datos' | 'clave', campo: string): boolean {
    const control = grupo === 'datos' ? this.datos.get(campo) : this.clave.get(campo);
    return !!control && control.invalid && control.touched;
  }

  tiene(campo: string, error: string): boolean {
    return !!this.datos.get(campo)?.hasError(error);
  }

  colorEstado(estado: string): string {
    return estado === 'PENDIENTE' ? 'text-bg-warning' : estado === 'RESUELTO' ? 'text-bg-success' : 'text-bg-secondary';
  }
}
