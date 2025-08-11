import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval, Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { SimonSayGameStatusResponse } from '../../models/simonsay.model';
import { SingleColorPickerModalComponent } from '../../components/single-color-picker-modal/single-color-picker-modal.component';
import { SimonSayGameViewModel } from '../../view-models/simonsay-game-view-model';
import { GameEndModalComponent } from '../../../../shared/components/modals/game-end-modal/game-end-modal.component';
import { GameApiService } from '../../../../services/gameservices/game-api.service';

@Component({
  standalone: true,
  selector: 'app-simonsay-game',
  imports: [CommonModule, SingleColorPickerModalComponent, GameEndModalComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private statusSubscription?: Subscription;
  private heartbeatSubscription?: Subscription;

  // Servicios
  private authService = inject(AuthService);
  private gameApiService = inject(GameApiService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simonSayService = inject(SimonSayService);

  // ViewModel
  vm = new SimonSayGameViewModel(this.authService);

  // Estados del modal de fin de juego
  showEndModal = false;
  isWinner = false;
  winnerName = '';
  loserName = '';

  // Estados específicos del modal
  modalTitle = '';
  modalSubtitle = '';

  isProcessingColor = false; // Para evitar clics múltiples
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const gameId = params['id'];
      if (gameId) {
        this.vm.setGameId(gameId);
        this.startGamePolling();
        this.startHeartbeat();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
    this.stopHeartbeat();
  }

  // === POLLING Y ESTADO ===

  startGamePolling() {
    this.statusSubscription = interval(1500)
      .pipe(
        switchMap(() => this.simonSayService.getGameStatus(this.vm.gameId())),
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error obteniendo estado:', error);
          this.toastr.error('Error de conexión');
          return [];
        }),
        finalize(() => this.vm.setLoading(false))
      )
      .subscribe((status: SimonSayGameStatusResponse) => {
        this.handleGameStatus(status);
      });
  }

  startHeartbeat() {
    this.heartbeatSubscription = interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.simonSayService.heartbeat(this.vm.gameId()).subscribe({
          error: (err) => console.warn('Heartbeat error:', err)
        });
      });
  }

  stopPolling() {
    this.statusSubscription?.unsubscribe();
  }

  stopHeartbeat() {
    this.heartbeatSubscription?.unsubscribe();
  }

  // === MANEJO DEL ESTADO DEL JUEGO ===

handleGameStatus(status: SimonSayGameStatusResponse) {
  console.log('=== HANDLE GAME STATUS ===');
  console.log('Status:', status.status);
  console.log('Phase:', status.phase);
  console.log('IsMyTurn:', status.isMyTurn);
  console.log('CurrentTurnUserId:', status.currentTurnUserId);
  console.log('PlayerChoosingUserId:', status.playerChoosingUserId);
  console.log('PlayerRepeatingUserId:', status.playerRepeatingUserId);
  console.log('My User ID:', this.vm.myUserId());
  console.log('Global sequence:', status.globalSequence);
  console.log('============================');

  this.vm.setGameStatus(status)

    if (status.status === 'finished') {
      this.handleGameEnd(status)
      return
    }

    if (status.globalSequence) {
      this.vm.setMyLocalSequence(status.globalSequence)
    }
    this.vm.setCurrentProgress(status.currentSequenceIndex || 0)

    // YA NO iniciar aquí. Solo esperar a que llegue choosing_first_color.
    if (status.status === 'started' && status.phase === 'unknown') {
      // Estado transitorio breve, no spamear notificaciones
      this.vm.setCanInteract(false)
      this.vm.setShowColorPicker(false)
      return
    }

    const reallyMyTurn =
      status.playerChoosingUserId === this.vm.myUserId() ||
      status.playerRepeatingUserId === this.vm.myUserId()

    if (reallyMyTurn) this.handleMyTurn(status)
    else this.handleOpponentTurn(status)
  }

requestLastColorAdded(newLength: number) {
  // CAMBIO: Verificar que el color no sea null/undefined
  const lastColor = this.vm.gameStatus()?.lastAddedColor;
  if (!lastColor) return; // Si no hay color, salir
  // Mostrar notificación
  this.toastr.info(`🎯 ${this.vm.gameStatus()?.opponentName} agregó ${lastColor.toUpperCase()} a tu secuencia`, 'Nuevo color');
}

handleMyTurn(status: SimonSayGameStatusResponse) {
  console.log('=== MY TURN ===', status.phase);

  switch (status.phase) {
    case 'choose_first_color':
      this.modalTitle = 'Primer color';
      this.modalSubtitle = 'Escoge el primer color para la secuencia de tu oponente';
      this.vm.setShowColorPicker(true);
      this.vm.setCanInteract(false);
      this.toastr.info('🎨 Tu turno: Escoge el primer color');
      break;

    case 'repeat_sequence':
      this.vm.setShowColorPicker(false);
      this.vm.setCanInteract(true);
      this.toastr.info(`🔄 Tu turno: Repite la secuencia de ${status.globalSequence?.length || 0} colores`);
      break;

    case 'choose_next_color':
      this.modalTitle = 'Agregar color';
      this.modalSubtitle = 'Escoge el siguiente color para la secuencia de tu oponente';
      this.vm.setShowColorPicker(true);
      this.vm.setCanInteract(false);
      this.toastr.info('🎨 Tu turno: Agrega un color a la secuencia');
      break;

    default:
      this.vm.setCanInteract(false);
      this.vm.setShowColorPicker(false);
      console.warn('Unknown phase for my turn:', status.phase);
  }
}

handleOpponentTurn(status: SimonSayGameStatusResponse) {
  console.log('=== OPPONENT TURN ===', status.phase);

  this.vm.setCanInteract(false);
  this.vm.setShowColorPicker(false);

  // Mostrar mensaje específico según la fase del oponente
  switch (status.phase) {
    case 'choose_first_color':
      this.toastr.info(`⏳ ${status.opponentName} está escogiendo el primer color`);
      break;
    case 'repeat_sequence':
      this.toastr.info(`⏳ ${status.opponentName} está repitiendo la secuencia`);
      break;
    case 'choose_next_color':
      this.toastr.info(`⏳ ${status.opponentName} está agregando un color`);
      break;
    case 'wait_opponent_choose':
      this.toastr.info(`⏳ ${status.opponentName} está escogiendo color`);
      break;
    case 'wait_opponent_repeat':
      this.toastr.info(`⏳ ${status.opponentName} está repitiendo secuencia`);
      break;
    default:
      console.log('Waiting for opponent...');
  }
}

  // === INTERACCIONES DEL JUGADOR (CORREGIDA) ===

  onColorClick(color: string) {
    // CAMBIO: Verificar que no estemos animando
    if (!this.vm.canInteract() || this.isProcessingColor ) {
      console.log('Click blocked - animation in progress or cannot interact');
      return;
    }

    const expectedColor = this.vm.getExpectedColor();
    if (!expectedColor) {
      console.log('No expected color, cannot proceed');
      return;
    }

    // Bloquear interacción inmediatamente
    this.isProcessingColor = true;
    this.vm.setCanInteract(false);

    console.log(`Color clicked: ${color}, Expected: ${expectedColor}`);

    this.simonSayService.playColor(this.vm.gameId(), color).subscribe({
      next: (response: any) => {
        this.isProcessingColor = false;

        if (color === expectedColor) {
          // Color correcto
          const newProgress = this.vm.currentProgress() + 1;
          this.vm.setCurrentProgress(newProgress);

          this.toastr.success(`✅ Correcto! ${newProgress}/${this.vm.mySequenceLength()}`);

          if (response.sequenceCompleted) {
            this.toastr.success('🎉 ¡Secuencia completada!');
            // No habilitar interacción aquí, esperar al siguiente turno
          } else {
            // CAMBIO: Pequeño delay antes de habilitar la siguiente interacción
            setTimeout(() => {
              this.vm.setCanInteract(true);
            }, 600);
          }
        }
      },
      error: (error) => {
        this.isProcessingColor = false;
        this.toastr.error(`❌ ¡Incorrecto! Era ${expectedColor.toUpperCase()}`, 'Game Over');
        // No habilitar interacción en error, el juego debería terminar
      }
    });
  }

  // CAMBIO: Mejorar las animaciones de feedback

  onColorChosenForOpponent(chosenColor: string) {
  const isFirstColor = this.vm.currentPhase() === 'choose_first_color';

  console.log('=== COLOR CHOSEN DEBUG ===');
  console.log('Color chosen:', chosenColor);
  console.log('Type:', typeof chosenColor);
  console.log('========================');

  const endpoint = isFirstColor
    ? this.simonSayService.chooseFirstColor(this.vm.gameId(), chosenColor)
    : this.simonSayService.chooseColor(this.vm.gameId(), chosenColor);

  endpoint.subscribe({
    next: (response) => {
      this.vm.setShowColorPicker(false);

      if (isFirstColor) {
        this.toastr.success(`✨ Primer color elegido: ${chosenColor.toUpperCase()}`);
      } else {
        this.toastr.success(`🎨 Color agregado a la secuencia del oponente`);
      }
    },
    error: (error) => {
      this.toastr.error('❌ Error al escoger color');
      console.error('Error:', error);
    }
  });
}

  // === LOCAL STORAGE ===
  // === FIN DEL JUEGO ===

  handleGameEnd(status: SimonSayGameStatusResponse) {
    if (this.showEndModal) return;

    this.isWinner = status.winner === this.vm.myUserId();
    this.winnerName = status.winnerName || 'Desconocido';
    this.loserName = status.loserName || 'Desconocido';

    this.showEndModal = true;
    this.stopPolling();
  }

  // === ACCIONES DEL MODAL DE FIN ===

    // ...existing code...

  onLeaveGame() {
    const gameId = this.vm.gameId();
    if (!gameId) return;

    this.vm.setLoading(true);

    // CAMBIO: Usar solo gameApiService.leaveGame()
    this.gameApiService.leaveGame(gameId).subscribe({
      next: (result) => {
        if (result.gameOver) {
          this.toastr.info('Has abandonado la partida. Tu oponente ha sido declarado ganador.', 'Partida finalizada');
        } else {
          this.toastr.info(result.message || 'Has salido del juego');
        }
        this.router.navigate(['/games/simonsay']);
      },
      error: (err) => {
        console.error('Error leaving game:', err);
        this.router.navigate(['/games/simonsay']);
      }
    });
  }

  // ELIMINAR: getMyPlayerGameId() ya no se necesita

  onNewGame() {
    this.router.navigate(['/games/simonsay']);
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
}
