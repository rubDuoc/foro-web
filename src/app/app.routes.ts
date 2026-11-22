import { Routes } from '@angular/router';

import { adminGuard, authGuard, invitadoGuard } from './guards/auth.guards';

// Publicas: inicio, temas y su detalle, login, registro y recuperar contraseña.
// Privadas (sesion iniciada): publicar, editar y perfil. Solo ADMIN: administracion.
export const routes: Routes = [
  { path: '', title: 'Inicio | Foro Conecta', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio) },
  { path: 'temas', title: 'Temas | Foro Conecta', loadComponent: () => import('./pages/temas/temas').then((m) => m.Temas) },
  { path: 'temas/:id', title: 'Tema | Foro Conecta', loadComponent: () => import('./pages/tema-detalle/tema-detalle').then((m) => m.TemaDetalle) },
  { path: 'login', title: 'Iniciar sesión | Foro Conecta', canActivate: [invitadoGuard], loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  { path: 'registro', title: 'Registro | Foro Conecta', canActivate: [invitadoGuard], loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro) },
  { path: 'recuperar', title: 'Recuperar contraseña | Foro Conecta', canActivate: [invitadoGuard], loadComponent: () => import('./pages/recuperar/recuperar').then((m) => m.Recuperar) },
  { path: 'publicar', title: 'Publicar tema | Foro Conecta', canActivate: [authGuard], loadComponent: () => import('./pages/tema-form/tema-form').then((m) => m.TemaForm) },
  { path: 'temas/:id/editar', title: 'Editar tema | Foro Conecta', canActivate: [authGuard], loadComponent: () => import('./pages/tema-form/tema-form').then((m) => m.TemaForm) },
  { path: 'perfil', title: 'Mi perfil | Foro Conecta', canActivate: [authGuard], loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil) },
  { path: 'admin/moderacion', title: 'Moderación | Foro Conecta', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/moderacion/moderacion').then((m) => m.Moderacion) },
  { path: 'admin/usuarios', title: 'Usuarios | Foro Conecta', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/usuarios/usuarios').then((m) => m.Usuarios) },
  { path: 'admin/categorias', title: 'Categorías | Foro Conecta', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/categorias/categorias').then((m) => m.Categorias) },
  { path: '**', title: 'Página no encontrada | Foro Conecta', loadComponent: () => import('./pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado) },
];
