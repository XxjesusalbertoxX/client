// src/app/pages/practica-3-battalla-naval/pages/join-game/join-game.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BattleShipService } from '../../../../services/battle-ship.service';
import { JoinGameResponse } from '../../models/battle-ship.model';

@Component({
  standalone: true,
  selector: 'app-join-game',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss']
})
export class JoinGameComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private battleShipService: BattleShipService,
    private router: Router
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const gameCode = this.form.value.code.toUpperCase();

    this.battleShipService.joinGame(gameCode).subscribe({
      next: (res: JoinGameResponse) => {
        console.log('Unido a partida:', res.gameId);
        this.router.navigate(['games/battleship/lobby'], { queryParams: { id: res.gameId } });
      },
      error: (err: any) => {
        console.error('Error al unirse a la partida:', err);
        this.errorMessage = 'No se pudo unir a la partida. Verifique el código e intente de nuevo.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
