import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { CATEGORIAS, COMENTARIOS, TEMAS } from '../data/datos-iniciales';
import { Categoria, Comentario, Tema, TipoContenido } from '../models/foro.models';
import { AuthService } from './auth.service';

export interface DatosTema {
  titulo: string;
  contenido: string;
  categoriaId: number;
}

// MODELO (MVC): categorias, temas y comentarios guardados en arreglos.
// Observer: cada coleccion es un BehaviorSubject; las vistas se suscriben y se actualizan solas.
// Privilegios (iguales a forum-service): USUARIO modifica solo lo suyo; ADMIN modifica todo y gestiona categorias.
@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly auth = inject(AuthService);

  private readonly categoriasSubject = new BehaviorSubject<Categoria[]>(structuredClone(CATEGORIAS));
  private readonly temasSubject = new BehaviorSubject<Tema[]>(structuredClone(TEMAS));
  private readonly comentariosSubject = new BehaviorSubject<Comentario[]>(structuredClone(COMENTARIOS));

  readonly categorias$ = this.categoriasSubject.asObservable();
  readonly temas$ = this.temasSubject.asObservable();
  readonly comentarios$ = this.comentariosSubject.asObservable();

  // Lo baneado por un administrador no se muestra en el foro
  readonly temasVisibles$ = this.temas$.pipe(
    map((temas) => temas.filter((t) => !t.baneado).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))),
  );
  readonly comentariosVisibles$ = this.comentarios$.pipe(map((cs) => cs.filter((c) => !c.baneado)));

  // Resumen: cantidad de temas visibles por categoria
  readonly resumenCategorias$ = combineLatest([this.categorias$, this.temasVisibles$]).pipe(
    map(([categorias, temas]) =>
      categorias.map((c) => ({ ...c, cantidad: temas.filter((t) => t.categoriaId === c.id).length })),
    ),
  );

  // ---------------- Categorias
  categoria(id: number): Categoria | undefined {
    return this.categoriasSubject.value.find((c) => c.id === id);
  }

  guardarCategoria(datos: Omit<Categoria, 'id'>, id?: number): void {
    this.exigirAdmin();
    const lista = this.categoriasSubject.value;
    if (lista.some((c) => c.nombre.toLowerCase() === datos.nombre.trim().toLowerCase() && c.id !== id)) {
      throw new Error(`Ya existe la categoria "${datos.nombre}"`);
    }
    const categoria = { ...datos, nombre: datos.nombre.trim() };
    this.categoriasSubject.next(
      id
        ? lista.map((c) => (c.id === id ? { ...categoria, id } : c))
        : [...lista, { ...categoria, id: this.siguienteId(lista) }],
    );
  }

  eliminarCategoria(id: number): void {
    this.exigirAdmin();
    if (this.temasSubject.value.some((t) => t.categoriaId === id)) {
      throw new Error('No se puede eliminar la categoria porque tiene temas asociados');
    }
    this.categoriasSubject.next(this.categoriasSubject.value.filter((c) => c.id !== id));
  }

  // ---------------- Temas
  tema(id: number): Tema | undefined {
    return this.temasSubject.value.find((t) => t.id === id && !t.baneado);
  }

  temasDeUsuario$(usuarioId: number) {
    return this.temasVisibles$.pipe(map((temas) => temas.filter((t) => t.usuarioId === usuarioId)));
  }

  publicarTema(datos: DatosTema): Tema {
    const autor = this.exigirSesion();
    const lista = this.temasSubject.value;
    const tema: Tema = {
      ...this.limpiar(datos),
      id: this.siguienteId(lista),
      usuarioId: autor.id,
      fechaCreacion: new Date().toISOString(),
      baneado: false,
    };
    this.temasSubject.next([...lista, tema]);
    return tema;
  }

  editarTema(id: number, datos: DatosTema): void {
    this.exigirAutorOAdmin(this.buscarTema(id).usuarioId, 'tema');
    this.temasSubject.next(this.temasSubject.value.map((t) => (t.id === id ? { ...t, ...this.limpiar(datos) } : t)));
  }

  eliminarTema(id: number): void {
    this.exigirAutorOAdmin(this.buscarTema(id).usuarioId, 'tema');
    this.temasSubject.next(this.temasSubject.value.filter((t) => t.id !== id));
    this.comentariosSubject.next(this.comentariosSubject.value.filter((c) => c.temaId !== id));
  }

  // ---------------- Comentarios
  comentariosDeTema$(temaId: number) {
    return this.comentariosVisibles$.pipe(
      map((cs) => cs.filter((c) => c.temaId === temaId).sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion))),
    );
  }

  comentar(temaId: number, contenido: string): void {
    const autor = this.exigirSesion();
    this.buscarTema(temaId);
    const lista = this.comentariosSubject.value;
    this.comentariosSubject.next([
      ...lista,
      { id: this.siguienteId(lista), contenido: contenido.trim(), usuarioId: autor.id, temaId, fechaCreacion: new Date().toISOString(), baneado: false },
    ]);
  }

  editarComentario(id: number, contenido: string): void {
    this.exigirAutorOAdmin(this.buscarComentario(id).usuarioId, 'comentario');
    this.comentariosSubject.next(this.comentariosSubject.value.map((c) => (c.id === id ? { ...c, contenido: contenido.trim() } : c)));
  }

  eliminarComentario(id: number): void {
    this.exigirAutorOAdmin(this.buscarComentario(id).usuarioId, 'comentario');
    this.comentariosSubject.next(this.comentariosSubject.value.filter((c) => c.id !== id));
  }

  // ---------------- Moderacion (la usa ModeracionService; solo ADMIN)
  textoDe(tipo: TipoContenido, id: number): string | undefined {
    if (tipo === 'TEMA') {
      const tema = this.temasSubject.value.find((t) => t.id === id);
      return tema && `${tema.titulo}: ${tema.contenido}`;
    }
    return this.comentariosSubject.value.find((c) => c.id === id)?.contenido;
  }

  existeVisible(tipo: TipoContenido, id: number): boolean {
    return tipo === 'TEMA'
      ? this.temasSubject.value.some((t) => t.id === id && !t.baneado)
      : this.comentariosSubject.value.some((c) => c.id === id && !c.baneado);
  }

  temaDeComentario(id: number): number | undefined {
    return this.comentariosSubject.value.find((c) => c.id === id)?.temaId;
  }

  moderar(tipo: TipoContenido, id: number, baneado: boolean, motivo?: string): void {
    this.exigirAdmin();
    const cambio = <T extends { id: number; baneado: boolean; motivoBaneo?: string }>(x: T): T =>
      x.id === id ? { ...x, baneado, motivoBaneo: baneado ? motivo : undefined } : x;
    if (tipo === 'TEMA') {
      this.temasSubject.next(this.temasSubject.value.map(cambio));
    } else {
      this.comentariosSubject.next(this.comentariosSubject.value.map(cambio));
    }
  }

  // ---------------- Privilegios
  puedeModificar(autorId: number): boolean {
    const actual = this.auth.usuarioActual;
    return !!actual && (actual.rol === 'ADMIN' || actual.id === autorId);
  }

  private exigirSesion() {
    const actual = this.auth.usuarioActual;
    if (!actual) {
      throw new Error('Debes iniciar sesion');
    }
    return actual;
  }

  private exigirAutorOAdmin(autorId: number, recurso: string): void {
    if (!this.puedeModificar(autorId)) {
      throw new Error(`Solo el autor o un administrador puede modificar este ${recurso}`);
    }
  }

  private exigirAdmin(): void {
    if (!this.auth.esAdmin) {
      throw new Error('Esta operacion requiere rol ADMIN');
    }
  }

  private buscarTema(id: number): Tema {
    const tema = this.tema(id);
    if (!tema) {
      throw new Error('El tema no existe');
    }
    return tema;
  }

  private buscarComentario(id: number): Comentario {
    const comentario = this.comentariosSubject.value.find((c) => c.id === id && !c.baneado);
    if (!comentario) {
      throw new Error('El comentario no existe');
    }
    return comentario;
  }

  private limpiar(datos: DatosTema): DatosTema {
    return { titulo: datos.titulo.trim(), contenido: datos.contenido.trim(), categoriaId: Number(datos.categoriaId) };
  }

  private siguienteId(lista: { id: number }[]): number {
    return Math.max(0, ...lista.map((x) => x.id)) + 1;
  }
}
