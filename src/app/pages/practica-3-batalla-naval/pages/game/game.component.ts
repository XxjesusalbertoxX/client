import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from '../../components/board/board.component'
import { GameViewModel } from '../../view-models/game-view-model'
import { BattleShipService } from '../../../../services/gameservices/battle-ship.service'
import { GameApiService } from '../../../../services/gameservices/game-api.service'
import { Subject, of, interval, Subscription, takeUntil } from 'rxjs'
import { AuthService } from '../../../../services/auth.service'
import { ToastrService } from 'ngx-toastr'
import { ActivatedRoute, Router } from '@angular/router'
import { GameEndModalComponent } from '../../../../shared/components/modals/game-end-modal/game-end-modal.component'
import { switchMap, catchError, finalize } from 'rxjs/operators'




@Component({
  standalone: true,
  selector: 'app-game',
  imports: [CommonModule, BoardComponent, GameEndModalComponent], // Añade GameEndModalComponent aquí
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private battleShipService = inject(BattleShipService);
  private gameApiService = inject(GameApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  
  initialLoadComplete = false;
  showConfirmLeaveModal = false;
  isProcessing = false;
  showEndModal = false;
  winnerName = '';
  loserName = '';
  isWinner = false;
  rematchRequested = false;
  opponentLeft = false;
  currentUserName = '';
  constructor(private toastr: ToastrService, /* otros servicios */) {}

  // ViewModel para cada instancia de juego
  viewModel = new GameViewModel(this.authService);

  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 2000; // 2 segundos

  ngOnInit() {
    // Obtener el nombre del usuario
    this.authService.getUser().subscribe(user => {
      console.log("usuario obtenido", user)
      if (user && user.user) {
        this.currentUserName = user.user.name;
        console.log("que royo", this.currentUserName)
      }
      this.setupGame();
    });
  }
  /**
   * Configura el juego obteniendo el ID de la ruta o del localStorage.
   * Inicia el polling para obtener actualizaciones del estado del juego.
   */
  public setupGame() {
    // Obtener gameId de los query params o localStorage
    const gameIdQuery = this.route.snapshot.queryParamMap.get('id');
    const gameIdStorage = localStorage.getItem('currentGameId');

    const gameId = gameIdQuery || gameIdStorage;

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

  handleGameEnd(gameData: any) {
    if (gameData.status === 'finished') {
      this.showEndModal = true;
      this.winnerName = gameData.winnerName;
      this.loserName = gameData.loserName;
      console.log(`Juego terminado. Ganador: ${this.winnerName}, Perdedor: ${this.loserName}, currentUserName: ${this.currentUserName}`);
      this.isWinner = this.currentUserName === gameData.winnerName;
      
      // Si el backend envía estos datos, úsalos
      this.rematchRequested = gameData.rematchRequested || false;
      this.opponentLeft = gameData.opponentLeft || false;
    }
  }

  private startGamePolling(gameId: string) {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => this.battleShipService.getGameStatus(gameId)),
        catchError(error => {
          this.viewModel.setError(`Error al obtener estado: ${error.message}`);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(gameData => {
        console.log('Estado del juego actualizado:', gameData);
        if (gameData) {
          // Solo mostrar la UI después de la primera carga exitosa
          if (!this.initialLoadComplete) {
            this.initialLoadComplete = true;
          }
          
          this.viewModel.setGameData(gameData);
          
          // Verificar si el juego ha terminado
          if (gameData.status === 'finished') {
            this.handleGameEnd(gameData);
          }
        }
      });
  }

  onAttack(coords: { x: number; y: number }) {
    if (!this.viewModel.isMyTurn() || this.isProcessing) {
      return;
    }

    const gameId = this.viewModel.getGameId();
    if (!gameId) return;

    this.isProcessing = true; // Deshabilitar botones
    
    this.battleShipService.attack(gameId, coords.x, coords.y)
      .pipe(
        catchError(error => {
          this.viewModel.setError(`Error al atacar: ${error.message}`);
          return of(null);
        }),
        finalize(() => {
          setTimeout(() => {
            this.isProcessing = false; // Habilitar botones después de un breve retraso
          }, 500);
        })
      )
      .subscribe(result => {
        if (result) {
          if (result.status === 'win' && result.message) {
            this.toastr.success(result.message, 'Victoria');
          }
        }
      });
  }
    
    // ...existing code...
    
    onLeaveGame() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      const gameId = this.viewModel.getGameId();
      
      if (gameId) {
        // CAMBIO: Usar solo gameApiService.leaveGame()
        this.gameApiService.leaveGame(gameId).subscribe({
          next: (result) => {
            if (result.gameOver) {
              this.toastr.info('Has abandonado la partida. Tu oponente ha sido declarado ganador.', 'Partida finalizada');
            } else {
              this.toastr.info(result.message || 'Has salido del juego');
            }
            this.router.navigate(['/games/battleship']);
          },
          error: (error) => {
            console.error('Error al salir:', error);
            this.router.navigate(['/games/battleship']);
          },
          complete: () => this.isProcessing = false
        });
      } else {
        this.router.navigate(['/games/battleship']);
        this.isProcessing = false;
      }
    }
    
    // ELIMINAR: getMyPlayerGameId() ya no se necesita

  confirmLeaveGame() {
    // Si el juego ya terminó, no necesitamos confirmación
    if (this.viewModel.gameStatus() === 'finished') {
      this.onLeaveGame();
      return;
    }
    
    // Si el juego está en progreso, pedimos confirmación
    this.showConfirmLeaveModal = true;
  }

  onCreateNewGame() {
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

  onGoHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
