import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameApiService } from '../../../../services/gameservices/game-api.service';
import { GameHomeComponent } from '../../../../shared/components/forms/game-home/game-home.component';

@Component({
  standalone: true,
  selector: 'app-battleship-home',
  imports: [CommonModule, GameHomeComponent],
  template: `
    <app-game-home 
      gameType="battleship"
      (createGame)="goToCreate()"
      (joinGame)="goToJoin()"
      (goBack)="goBack()">
    </app-game-home>
  `
})
export class BattleshipHomeComponent {
  constructor(
    private router: Router,
    private gameApiService: GameApiService
  ) {}

  goToCreate() {
    this.gameApiService
      .createGame('battleship')
      .subscribe({
        next: (res) => {
          this.router.navigate(['games/battleship/lobby'], {
            queryParams: { id: res.gameId, code: res.code },
          });
        },
        error: (err) => {
          console.error('Error creando partida', err);
        },
      });
  }

  goToJoin() {
    this.router.navigateByUrl('games/battleship/join');
  }

  goBack() {
    this.router.navigate(['/games']);
  }
}