import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PasswordReglas } from '../../layout/password-reglas';
import { UsuarioService } from '../../services/usuario.service';
import { camposIguales, passwordSegura, sinEspaciosVacios, soloLetras } from '../../validators/foro.validators';

// CONTROLADOR (MVC): registro de usuarios (siempre con rol USUARIO, igual que user-service)
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, PasswordReglas],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly usuarios = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly error = signal('');
  protected readonly verPassword = signal(false);

  // Validadores que consultan la lista de usuarios: nombre de usuario y correo no repetidos
  private readonly usernameLibre = (c: AbstractControl): ValidationErrors | null =>
    c.value && !this.usuarios.usernameDisponible(c.value) ? { ocupado: true } : null;
  private readonly emailLibre = (c: AbstractControl): ValidationErrors | null =>
    c.value && !this.usuarios.emailDisponible(c.value) ? { ocupado: true } : null;

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), soloLetras, sinEspaciosVacios]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_]+$/), this.usernameLibre]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150), this.emailLibre]],
      password: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
      normas: [false, [Validators.requiredTrue]],
    },
    { validators: camposIguales('password', 'confirmar') },
  );

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      const { nombre, username, email, password } = this.form.getRawValue();
      this.usuarios.registrar({ nombre, username, email, password });
      this.router.navigate(['/login'], { queryParams: { registrado: 1 } });
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  error_(campo: string, tipo: string): boolean {
    return !!this.form.get(campo)?.hasError(tipo);
  }
}
