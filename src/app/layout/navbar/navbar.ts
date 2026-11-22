import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// CONTROLADOR (MVC) de la barra de navegacion: muestra opciones distintas segun el rol
@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Observer: la barra se actualiza sola al iniciar o cerrar sesion
  protected readonly usuario$ = this.auth.usuario$;

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login'], { queryParams: { salida: 1 } });
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
