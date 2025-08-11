import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { ToastrService } from 'ngx-toastr';
import { GameJoinComponent } from '../../../../shared/components/forms/game-join/game-join.component';

@Component({
  standalone: true,
  selector: 'app-join-simonsay',
  imports: [CommonModule, GameJoinComponent],
  template: `
    <app-game-join
      gameType="simon"
      [isLoading]="isLoading"
      [errorMessage]="errorMessage"
      (submitCode)="onSubmitCode($event)"
      (goBack)="goBack()">
    </app-game-join>
  `
})
export class JoinSimonsayComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private simonSayService: SimonSayService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmitCode(code: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.simonSayService.joinGame(code).subscribe({
      next: (response) => {
        this.toastr.success('Te has unido a la partida');
        this.router.navigate(['/games/simonsay/lobby'], {
          queryParams: { id: response.gameId }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al unirse a la partida';
        this.isLoading = false;
        this.toastr.error(this.errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/games/simonsay']);
  }
}
