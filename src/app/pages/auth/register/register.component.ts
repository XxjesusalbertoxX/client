import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { onlyLetters, passwordStrength, uniqueEmailValidator } from '../../../shared/validators/validators'
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRegister } from '../../../models/user.model';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router); // Agregar esta línea


  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), onlyLetters()]],
    email: [
    '',
    [Validators.required, Validators.email],
    [uniqueEmailValidator(this.auth)] // ✅ Aquí no hay async/await
    ],
    password: ['', [Validators.required, Validators.minLength(6), passwordStrength()]],
  });

  submitting = false;
  errorMsg = '';

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMsg = '';

    const data: UserRegister = this.form.value as UserRegister;

    this.auth.register(data).subscribe({
      next: (res) => {
        this.submitting = false;
        alert('Usuario registrado');
        this.form.reset();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || 'Error registrando usuario';
      },
    });
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
