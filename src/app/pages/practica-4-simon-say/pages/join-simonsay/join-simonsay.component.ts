import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-join-simonsay',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        
        <!-- Logo/Título -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🎨</div>
          <h1 class="text-4xl font-bold text-white mb-2">Simon Dice</h1>
          <p class="text-gray-300">Únete a una partida existente</p>
        </div>

        <!-- Formulario principal -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" 
              class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          
          <div class="mb-6">
            <label for="code" class="block text-white font-medium mb-3">Código de la partida</label>
            <input
              id="code"
              type="text"
              formControlName="code"
              placeholder="Ej: ABC12345"
              class="w-full px-4 py-4 rounded-2xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 text-center text-xl font-mono tracking-wider uppercase"
              maxlength="8"
              [class.border-red-400]="form.get('code')?.invalid && form.get('code')?.touched"
            />
            
            <div *ngIf="form.get('code')?.invalid && form.get('code')?.touched" 
                 class="text-red-400 text-sm mt-2 animate-pulse">
              El código debe tener 8 caracteres
            </div>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || isLoading"
            class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            
            <span *ngIf="!isLoading" class="flex items-center justify-center">
              <span class="mr-2">🎯</span>
              Unirse a la partida
            </span>
            
            <span *ngIf="isLoading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Buscando partida...
            </span>
          </button>

          <div *ngIf="errorMessage" 
               class="mt-4 p-4 bg-red-500/20 border border-red-400 rounded-xl text-red-300 text-center animate-pulse">
            {{ errorMessage }}
          </div>
        </form>

        <!-- Botón de volver -->
        <div class="text-center mt-6">
          <button
            (click)="goBack()"
            class="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4">
            ← Volver al menú
          </button>
        </div>
      </div>
    </div>
  `
})
export class JoinSimonsayComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
  });

  isLoading = false;
  errorMessage = '';

  constructor(
    private simonSayService: SimonSayService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const code = this.form.value.code!.toUpperCase();

      this.simonSayService.joinGame(code).subscribe({
        next: (response) => {
          this.router.navigate(['/games/simonsay/lobby'], {
            queryParams: { id: response.gameId }
          });
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al unirse a la partida';
          this.isLoading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/games/simonsay']);
  }
}