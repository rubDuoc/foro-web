import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <img src="logo.svg" alt="" width="90" height="90" class="mb-3" />
      <h1 class="display-5">404</h1>
      <p class="lead">La página que buscas no existe.</p>
      <a class="btn btn-primary" routerLink="/"><i class="bi bi-house-door"></i> Volver al inicio</a>
    </div>
  `,
})
export class NoEncontrado {}
