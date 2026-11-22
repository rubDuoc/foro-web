import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PasswordReglas } from '../../layout/password-reglas';
import { UsuarioService } from '../../services/usuario.service';
import { camposIguales, passwordSegura } from '../../validators/foro.validators';

// CONTROLADOR (MVC): recuperar contraseña en dos pasos.
// 1) Se ingresa el correo y se "envia" un codigo (como no hay servidor de correo, se muestra en pantalla).
// 2) Con el codigo se define una nueva contraseña que cumple las reglas de seguridad.
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, PasswordReglas],
  templateUrl: './recuperar.html',
})
export class Recuperar {
  private readonly usuarios = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly paso = signal<1 | 2>(1);
  protected readonly codigoEnviado = signal('');
  protected readonly error = signal('');

  protected readonly formCorreo = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  protected readonly formNueva = this.fb.nonNullable.group(
    {
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: camposIguales('password', 'confirmar') },
  );

  enviarCodigo(): void {
    if (this.formCorreo.invalid) {
      this.formCorreo.markAllAsTouched();
      return;
    }
    const codigo = this.usuarios.generarCodigoRecuperacion(this.formCorreo.controls.email.value);
    if (!codigo) {
      this.error.set('No existe una cuenta con ese correo');
      return;
    }
    this.error.set('');
    this.codigoEnviado.set(codigo);
    this.paso.set(2);
  }

  restablecer(): void {
    if (this.formNueva.invalid) {
      this.formNueva.markAllAsTouched();
      return;
    }
    const { codigo, password } = this.formNueva.getRawValue();
    if (this.usuarios.restablecerPassword(this.formCorreo.controls.email.value, codigo, password)) {
      this.router.navigate(['/login'], { queryParams: { recuperada: 1 } });
    } else {
      this.error.set('El código ingresado no es correcto');
    }
  }

  invalido(form: 'correo' | 'nueva', campo: string): boolean {
    const control = form === 'correo' ? this.formCorreo.get(campo) : this.formNueva.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
