import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs'; // ✅ NO 'rxjs/operators'
import { AuthService } from '../../services/auth.service';

export function onlyLetters(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    return control.value && !regex.test(control.value) ? { onlyLetters: true } : null;
  };
}

export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasUpper && hasLower && hasNumber ? null : { passwordStrength: true };
  };
}

export function uniqueEmailValidator(auth: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    return auth.checkEmail(control.value).pipe(
      map((exists) => (exists ? { uniqueEmail: true } : null)),
      catchError(() => of(null))
    );
  };
}
