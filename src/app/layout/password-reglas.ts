import { Component, input } from '@angular/core';

import { REGLAS_PASSWORD } from '../validators/foro.validators';

// Lista de requisitos de la contraseña que se marca en verde a medida que se cumplen
@Component({
  selector: 'app-password-reglas',
  template: `
    <ul class="list-unstyled small mt-2 mb-0 reglas">
      @for (regla of reglas; track regla.clave) {
        <li [class.text-success]="regla.cumple(valor())" [class.text-muted]="!regla.cumple(valor())">
          <i class="bi" [class.bi-check-circle-fill]="regla.cumple(valor())" [class.bi-circle]="!regla.cumple(valor())"></i>
          {{ regla.texto }}
        </li>
      }
    </ul>
  `,
})
export class PasswordReglas {
  readonly valor = input<string>('');
  protected readonly reglas = REGLAS_PASSWORD;
}
