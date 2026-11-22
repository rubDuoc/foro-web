import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// CONTROLADOR (MVC): inicio de sesion
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Parametros de la URL: pagina a la que volver, y avisos de registro, recuperacion o salida
  readonly volver = input<string>();
  readonly registrado = input<string>();
  readonly recuperada = input<string>();
  readonly salida = input<string>();

  protected readonly error = signal('');
  protected readonly verPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(64)]],
  });

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    if (this.auth.login(username, password)) {
      this.router.navigateByUrl(this.volver() || '/');
    } else {
      // Mismo mensaje si el usuario no existe o si la contraseña es incorrecta
      this.error.set('Usuario o contraseña incorrectos');
      this.form.controls.password.reset();
    }
  }

  invalido(campo: 'username' | 'password'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }
}
