import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Paginas privadas: si no hay sesion, se redirige al login y luego se vuelve a la pagina pedida
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.estaAutenticado || inject(Router).createUrlTree(['/login'], { queryParams: { volver: state.url } });
};

// Paginas de administracion: solo rol ADMIN
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.esAdmin) {
    return true;
  }
  return inject(Router).createUrlTree(auth.estaAutenticado ? ['/'] : ['/login']);
};

// Login, registro y recuperar contraseña: solo para quien no ha iniciado sesion
export const invitadoGuard: CanActivateFn = () =>
  !inject(AuthService).estaAutenticado || inject(Router).createUrlTree(['/']);
