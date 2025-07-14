import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BattleShipService } from '../../../../services/battle-ship.service';

@Component({
  standalone: true,
  selector: 'app-battleship-home',
  imports: [CommonModule],
  templateUrl: './battleship-home.component.html',
  styleUrls: ['./battleship-home.component.scss'],
})
export class BattleshipHomeComponent {
  constructor(
    private router: Router,
    private battleShipService: BattleShipService
  ) {}

  goToCreate() {
    this.battleShipService
      .createGame({ gameTypeId: 1 })
      .subscribe({
        next: (res) => {
          this.router.navigate(['games/battleship/lobby'], {
            queryParams: { id: res.id, code: res.code },
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
}
