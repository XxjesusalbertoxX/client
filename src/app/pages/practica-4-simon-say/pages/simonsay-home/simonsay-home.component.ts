import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { GameHomeComponent } from '../../../../shared/components/forms/game-home/game-home.component';

@Component({
  standalone: true,
  selector: 'app-simonsay-home',
  imports: [CommonModule, GameHomeComponent],
  template: `
    <app-game-home 
      gameType="simon"
      (createGame)="goToCreate()"
      (joinGame)="goToJoin()"
      (goBack)="goBack()">
    </app-game-home>
  `
})
export class SimonsayHomeComponent {
  constructor(
    private router: Router,
    private simonSayService: SimonSayService
  ) {}

  goToCreate() {
    this.simonSayService.createGame().subscribe({
      next: (res) => {
        this.router.navigate(['games/simonsay/lobby'], {
          queryParams: { id: res.gameId, code: res.code },
        });
      },
      error: (err) => {
        console.error('Error creando partida', err);
      },
    });
  }

  goToJoin() {
    this.router.navigateByUrl('games/simonsay/join');
  }

  goBack() {
    this.router.navigate(['/games']);
  }
}