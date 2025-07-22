import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BoardComponent } from '../../components/board/board.component';
import { BattleShipService } from '../../../../services/battle-ship.service';
import { GameViewModel } from '../../view-models/game-view-model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [CommonModule, BoardComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private battleShipService = inject(BattleShipService);
  private route = inject(ActivatedRoute);

  // ViewModel para cada instancia de juego
  viewModel = new GameViewModel();

  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 2000; // 2 segundos

  ngOnInit() {
    this.setupGame();
  }
  /**
   * Configura el juego obteniendo el ID de la ruta o del localStorage.
   * Inicia el polling para obtener actualizaciones del estado del juego.
   */
  public setupGame() {
    // Obtener gameId de la ruta o localStorage
    const gameIdParam = this.route.snapshot.paramMap.get('id');
    const gameIdStorage = localStorage.getItem('currentGameId');

    const gameId = gameIdParam || gameIdStorage;

    if (!gameId) {
      this.viewModel.setError('No se encontró ID del juego');
      return;
    }

    // Guardar el ID en el ViewModel y en el servicio
    this.viewModel.setGameId(gameId);
    this.battleShipService.setGameId(gameId);

    // Iniciar el polling para actualizaciones del juego
    this.startGamePolling(gameId);
  }

  private startGamePolling(gameId: string) {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => this.battleShipService.getGameStatus(gameId)),
        catchError(error => {
          this.viewModel.setError(`Error al obtener estado: ${error.message}`);
          return of(null); // Continuar el observable
        }),
        takeUntilDestroyed() // Se desuscribe automáticamente cuando el componente se destruye
      )
      .subscribe(gameData => {
        if (gameData) {
          this.viewModel.setGameData(gameData);
        }
      });
  }

  onAttack(coords: { x: number; y: number }) {
    if (!this.viewModel.isMyTurn()) {
      console.warn('No es tu turno');
      return;
    }

    const gameId = this.viewModel.getGameId();
    if (!gameId) return;

    this.battleShipService.attack(gameId, coords)
      .pipe(
        catchError(error => {
          this.viewModel.setError(`Error al atacar: ${error.message}`);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          console.log(`Ataque a (${coords.x},${coords.y}): ${result.status}`);
        }
        // El estado actualizado llegará en el siguiente polling
      });
  }

  ngOnDestroy() {
    // La desuscripción ahora es manejada por takeUntilDestroyed()
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
