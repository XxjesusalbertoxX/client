import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { AuthService } from '../../../../services/auth.service';
import { LoteriaViewModel } from '../../view-models/loteriaViewmodel';
import { GameAnfitrionComponent } from '../game-anfitrion/game-anfitrion.component';
import { GamePlayersComponent } from '../game-players/game-players.component';

@Component({
  standalone: true,
  selector: 'app-loteria-game',
  imports: [CommonModule, GameAnfitrionComponent, GamePlayersComponent],
  templateUrl: './loteria-game.component.html',
  styleUrls: ['./loteria-game.component.scss']

})
export class LoteriaGameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteriaService = inject(LoteriaService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  viewModel = new LoteriaViewModel(this.authService);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];

      if (!id) {
        this.router.navigate(['/games/loteria']);
        return;
      }

      this.viewModel.setGameId(id);
      this.startPolling();
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);

    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    // Poll inmediato
    this.pollGameStatus();

    // Polling cada 1 segundo durante el juego
    this.intervalId = setInterval(() => {
      this.pollGameStatus();
    }, 1000);
  }

  pollGameStatus() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.getGameStatus(gameId).subscribe({
      next: (status) => {
        this.viewModel.setLoading(false);
        this.viewModel.setGameStatus(status);

        // Si el juego terminó, mostrar resultados
        if (status.status === 'finished') {
          this.handleGameFinished();
        }
      },
      error: (error) => {
        console.error('Error polling game:', error);
        this.viewModel.setLoading(false);

        if (error.status === 404) {
          this.toastr.error('La partida no existe o ha terminado');
          this.router.navigate(['/games/loteria']);
        }
      }
    });
  }

  private handleGameFinished() {
    // TODO: Mostrar modal de resultados y redirigir después
    setTimeout(() => {
      this.router.navigate(['/games/loteria']);
    }, 5000);
  }
}
