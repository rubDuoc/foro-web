import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Reglas de seguridad de la contraseña (se muestran como lista en los formularios)
export const REGLAS_PASSWORD = [
  { clave: 'largoMinimo', texto: 'Al menos 8 caracteres', cumple: (v: string) => v.length >= 8 },
  { clave: 'largoMaximo', texto: 'Máximo 20 caracteres', cumple: (v: string) => v.length <= 20 },
  { clave: 'mayuscula', texto: 'Una letra mayúscula', cumple: (v: string) => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { clave: 'minuscula', texto: 'Una letra minúscula', cumple: (v: string) => /[a-záéíóúñ]/.test(v) },
  { clave: 'numero', texto: 'Un número', cumple: (v: string) => /\d/.test(v) },
  { clave: 'especial', texto: 'Un carácter especial (!@#$%&*...)', cumple: (v: string) => /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(v) },
];

// Valida las 6 reglas. Un campo vacio lo controla Validators.required
export const passwordSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value ?? '';
  if (!valor) {
    return null;
  }
  const errores: ValidationErrors = {};
  REGLAS_PASSWORD.filter((r) => !r.cumple(valor)).forEach((r) => (errores[r.clave] = true));
  if (/\s/.test(valor)) {
    errores['espacios'] = true;
  }
  return Object.keys(errores).length ? errores : null;
};

// Validador de grupo: los dos campos deben ser iguales (por ejemplo, contraseña y confirmacion)
export function camposIguales(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const a = grupo.get(campo)?.value;
    const b = grupo.get(confirmacion)?.value;
    return a && b && a !== b ? { noCoinciden: true } : null;
  };
}

// Sin espacios al inicio o al final y no solo espacios
export const sinEspaciosVacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0 ? { soloEspacios: true } : null;
};

// Solo letras (con tildes) y espacios, para nombres de personas
export const soloLetras: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value ?? '';
  return valor && !/^[A-Za-zÁÉÍÓÚÑáéíóúñü ]+$/.test(valor) ? { soloLetras: true } : null;
};
