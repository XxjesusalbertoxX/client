import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InputComponent } from '../../../shared/components/inputs/input/input.component';
import { ButtonComponent } from '../../../shared/components/commons/button/button.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form;

  submitting = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }

    this.submitting = true
    this.errorMsg = ''

    const email = this.form.get('email')?.value ?? ''
    const password = this.form.get('password')?.value ?? ''

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.submitting = false

        const access = res?.accessToken
        const refresh = res?.refreshToken

        if (access && refresh) {
          this.auth.saveTokens(access, refresh)
          this.router.navigate(['/people'])
        } else {
          this.errorMsg = 'Login response incompleto'
        }
      },
      error: (err) => {
        this.submitting = false
        this.errorMsg = err?.error?.message || 'Login failed'
        console.error(err)
      }
    })
  }


  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }
}
