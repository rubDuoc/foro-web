# Foro Conecta (foro-web)

Frontend en **Angular 21** del Sistema de Foros en Línea (Desarrollo Full Stack III - DSY2205).
Funciona de forma independiente del backend: la información se maneja con **arreglos de Angular**
(los mismos datos iniciales de los scripts SQL de los microservicios).

## Tecnologías y diseño

- Angular 21 (componentes standalone, rutas con carga diferida, formularios reactivos)
- **Bootstrap 5.3** y Bootstrap Icons, con la **grilla de 12 columnas** (celular, tablet y escritorio)
- Identidad propia: nombre *Foro Conecta*, logo SVG, ilustración de portada y paleta índigo `#3F3D9E` / coral `#FF6B5B`

## Patrones de diseño

- **MVC** (arquetipo):
  - **Modelo**: `models/` (interfaces), `data/` (arreglos) y `services/` (reglas de negocio).
  - **Vista**: plantillas `.html`.
  - **Controlador**: clases de los componentes en `pages/` y `layout/`.
- **Observer**: cada servicio publica sus datos con `BehaviorSubject`, y las vistas se suscriben con el pipe
  `async`. Al publicar, comentar, reportar o moderar, todas las pantallas se actualizan solas.
- **Singleton**: servicios con `providedIn: 'root'` (una sola instancia de los datos y de la sesión).

## Roles

| Funcionalidad | Invitado | USUARIO | ADMIN |
|---|---|---|---|
| Ver inicio, temas, búsqueda y comentarios | Sí | Sí | Sí |
| Publicar temas y comentar | No | Sí | Sí |
| Editar o eliminar temas y comentarios | No | Solo los propios | Todos |
| Reportar contenido | No | Sí | Sí |
| Modificar perfil | No | Sí | Sí |
| Moderación (reportes, banear, historial) | No | No | Sí |
| Gestión de usuarios (roles, eliminar) y categorías | No | No | Sí |

Las rutas privadas están protegidas con *guards* (`authGuard` y `adminGuard`).

## Páginas

- **Inicio**: portada, estadísticas, categorías y temas recientes.
- **Inicio de sesión**, **Registro de usuarios** y **Recuperar contraseña** (código de verificación simulado en 2 pasos).
- **Modificación de perfil**: datos personales, cambio de contraseña, mis temas y mis reportes.
- **Temas**: búsqueda y filtro por categoría. **Detalle de tema**: comentarios, editar, eliminar y reportar.
- **Publicar y editar tema**.
- **Administración**: moderación, usuarios y categorías.

### Validaciones de contraseña (6)
Entre 8 y 20 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial,
y sin espacios. Además, la confirmación debe coincidir. Todos los formularios validan cada campo.

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin_foro, carla_mod | Admin1234 | ADMIN |
| maria_dev, juan_gamer, sofia_music | Usuario1234 | USUARIO |

## Ejecutar

```
npm install
ng serve
```

Abrir `http://localhost:4200`. Pruebas unitarias: `ng test`.
