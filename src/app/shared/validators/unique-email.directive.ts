import { Directive, Input } from '@angular/core';
import {
  NG_ASYNC_VALIDATORS,
  AsyncValidator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: '[appUniqueEmail]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: UniqueEmailDirective,
      multi: true
    }
  ]
})
export class UniqueEmailDirective implements AsyncValidator {
  @Input('appUniqueEmail') authService!: AuthService;

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) return of(null);

    return this.authService.checkEmail(control.value).pipe(
      map((exists: boolean) => (exists ? { uniqueEmail: true } : null)),
      catchError(() => of(null))
    );
  }
}
