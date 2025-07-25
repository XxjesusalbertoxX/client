import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameApiService } from '../../services/gameservices/game-api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-join-game',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss']
})
export class JoinGameComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
  });

  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private gameApiService: GameApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const code = this.form.value.code!.toUpperCase();

      this.gameApiService.joinGame(code).subscribe({
        next: (response) => {
          this.router.navigate(['/games/battleship/lobby'], {
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
    this.router.navigate(['/games/battleship']);
  }
}
