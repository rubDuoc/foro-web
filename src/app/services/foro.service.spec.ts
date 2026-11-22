import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { ForoService } from './foro.service';
import { ModeracionService } from './moderacion.service';

// Logica de negocio del foro con los dos roles (datos en arreglos, sin backend)
describe('ForoService y ModeracionService', () => {
  let auth: AuthService;
  let foro: ForoService;
  let moderacion: ModeracionService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    foro = TestBed.inject(ForoService);
    moderacion = TestBed.inject(ModeracionService);
  });

  it('un USUARIO publica y edita su propio tema', () => {
    auth.login('juan_gamer', 'Usuario1234');
    const tema = foro.publicarTema({ titulo: 'Tema de prueba', contenido: 'Contenido de prueba', categoriaId: 1 });
    expect(tema.usuarioId).toBe(4);
    foro.editarTema(tema.id, { titulo: 'Tema editado', contenido: 'Contenido de prueba', categoriaId: 1 });
    expect(foro.tema(tema.id)?.titulo).toBe('Tema editado');
  });

  it('un USUARIO no puede editar ni borrar el tema de otro', () => {
    auth.login('juan_gamer', 'Usuario1234');
    expect(() => foro.eliminarTema(1)).toThrowError(/autor o un administrador/);
    expect(() => foro.editarTema(1, { titulo: 'Hackeado', contenido: 'xxxxxxxxxx', categoriaId: 1 })).toThrow();
  });

  it('un ADMIN puede borrar cualquier tema y gestionar categorias', () => {
    auth.login('admin_foro', 'Admin1234');
    foro.eliminarTema(1);
    expect(foro.tema(1)).toBeUndefined();
    foro.guardarCategoria({ nombre: 'Libros', descripcion: 'Lecturas', icono: 'bi-book' });
    expect(foro.categoria(6)?.nombre).toBe('Libros');
  });

  it('un USUARIO no puede crear categorias', () => {
    auth.login('maria_dev', 'Usuario1234');
    expect(() => foro.guardarCategoria({ nombre: 'Libros', descripcion: '', icono: 'bi-book' })).toThrowError(/ADMIN/);
  });

  it('banear desde un reporte oculta el tema y resuelve el reporte', async () => {
    auth.login('sofia_music', 'Usuario1234');
    moderacion.reportar('TEMA', 2, 'Contenido que incumple las normas');
    auth.logout();
    auth.login('admin_foro', 'Admin1234');
    const reporte = (await firstValueFrom(moderacion.pendientes$)).find((r) => r.tipoContenido === 'TEMA' && r.contenidoId === 2)!;
    moderacion.moderar('BANEAR', 'TEMA', 2, 'Spam', reporte.id);

    const visibles = await firstValueFrom(foro.temasVisibles$);
    expect(visibles.some((t) => t.id === 2)).toBe(false);
    const reportes = await firstValueFrom(moderacion.reportes$);
    expect(reportes.find((r) => r.id === reporte.id)?.estado).toBe('RESUELTO');
  });

  it('un USUARIO no puede moderar ni reportar dos veces lo mismo', () => {
    auth.login('maria_dev', 'Usuario1234');
    expect(() => moderacion.moderar('BANEAR', 'TEMA', 3, 'x')).toThrowError(/ADMIN/);
    moderacion.reportar('TEMA', 4, 'Contenido que incumple las normas');
    expect(() => moderacion.reportar('TEMA', 4, 'Otra vez el mismo reporte')).toThrowError(/pendiente/);
  });

  it('login incorrecto no inicia sesion', () => {
    expect(auth.login('maria_dev', 'mala')).toBe(false);
    expect(auth.estaAutenticado).toBe(false);
  });
});
