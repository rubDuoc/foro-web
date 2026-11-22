import { FormControl, FormGroup } from '@angular/forms';

import { camposIguales, passwordSegura } from './foro.validators';

describe('Validaciones de contraseña', () => {
  const errores = (valor: string) => passwordSegura(new FormControl(valor));

  it('acepta una contraseña que cumple las 6 reglas', () => {
    expect(errores('Segura#2026')).toBeNull();
  });

  it('detecta cada regla incumplida', () => {
    expect(errores('Ab1#')).toHaveProperty('largoMinimo');
    expect(errores('Abcdefghijk1#lmnopqrstu')).toHaveProperty('largoMaximo');
    expect(errores('segura#2026')).toHaveProperty('mayuscula');
    expect(errores('SEGURA#2026')).toHaveProperty('minuscula');
    expect(errores('Segura#abc')).toHaveProperty('numero');
    expect(errores('Segura2026')).toHaveProperty('especial');
    expect(errores('Segura #2026')).toHaveProperty('espacios');
  });

  it('la confirmacion debe coincidir', () => {
    const grupo = new FormGroup(
      { a: new FormControl('Segura#2026'), b: new FormControl('Otra#2026') },
      { validators: camposIguales('a', 'b') },
    );
    expect(grupo.hasError('noCoinciden')).toBe(true);
  });
});
