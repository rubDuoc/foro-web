import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <!-- VISTA (MVC): pie de pagina -->
    <footer class="pie mt-5 py-4">
      <div class="container">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6 text-center text-md-start">
            <img src="logo.svg" alt="" width="28" height="28" class="me-2" />
            <strong>Foro Conecta</strong> · Comunidad para conversar de lo que te gusta
          </div>
          <div class="col-12 col-md-6 text-center text-md-end">
            <a routerLink="/temas">Temas</a> · <a routerLink="/registro">Únete</a> ·
            <span>Desarrollo Full Stack III · {{ anio }}</span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly anio = new Date().getFullYear();
}
