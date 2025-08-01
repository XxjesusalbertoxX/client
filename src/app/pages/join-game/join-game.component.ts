import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameApiService } from '../../services/gameservices/game-api.service';
import { ToastrService } from 'ngx-toastr';
import { GameJoinComponent } from '../../shared/components/forms/game-join/game-join.component';

@Component({
  standalone: true,
  selector: 'app-join-game',
  imports: [CommonModule, GameJoinComponent],
  template: `
    <app-game-join 
      gameType="battleship"
      [isLoading]="isLoading"
      [errorMessage]="errorMessage"
      (submitCode)="onSubmitCode($event)"
      (goBack)="goBack()">
    </app-game-join>
  `
})
export class JoinGameComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private gameApiService: GameApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmitCode(code: string) {
    this.isLoading = true;
    this.errorMessage = '';

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

  goBack() {
    this.router.navigate(['/games/battleship']);
  }
}