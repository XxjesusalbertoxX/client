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
  rematchRequested = false;
  opponentLeft = false;

  // Estados específicos del modal
  modalTitle = '';
  modalSubtitle = '';

  sequenceSpeed = 800; // ms entre colores
  isProcessingColor = false; // Para evitar clics múltiples
    isAnimatingSequence = false; // NUEVO: Flag para evitar múltiples animaciones
  hasShownCurrentSequence = false; // NUEVO: Flag para saber si ya se mostró la secuencia actual

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const gameId = params['id'];
      if (gameId) {
        this.vm.setGameId(gameId);
        this.startGamePolling();
        this.startHeartbeat();
        this.loadSequencesFromStorage();
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
  const previousMyLength = this.vm.myLocalSequence().length;
  const currentVersion = status.mySequenceVersion || 0; // Usar la versión del backend

  console.log('=== HANDLE GAME STATUS ===');
  console.log('Previous length:', previousMyLength);
  console.log('Backend version:', currentVersion);
  console.log('Last color added:', status.lastColorAdded);
  console.log('============================');

  this.vm.setGameStatus(status);

  if (status.status === 'finished') {
    this.handleGameEnd(status);
    return;
  }

  // CAMBIO: Detectar por versión del backend vs localStorage
  if (currentVersion > previousMyLength && status.lastColorAdded) {
    this.addNewColorToSequence(status.lastColorAdded);
  }

  // Resto igual...
  this.vm.setCurrentProgress(status.myCurrentProgress || 0);

  if (status.isMyTurn) {
    this.handleMyTurn(status);
  } else {
    this.handleOpponentTurn(status);
  }
}

// NUEVO: Método más claro y seguro
addNewColorToSequence(newColor: string) {
  const currentSequence = this.vm.myLocalSequence();
  const newSequence = [...currentSequence, newColor];

  console.log('Adding new color to sequence:', newColor);
  console.log('Old sequence:', currentSequence);
  console.log('New sequence:', newSequence);

  this.vm.setMyLocalSequence(newSequence);
  this.saveSequenceToStorage('my', newSequence);

  // Mostrar notificación
  this.toastr.info(
    `🎯 ${this.vm.gameStatus()?.opponentName || 'Oponente'} agregó ${newColor.toUpperCase()} a tu secuencia`,
    'Nuevo color',
    { timeOut: 3000 }
  );
}

// ELIMINAR este método que no funciona:
// requestLastColorAdded(newLength: number) { ... }

requestLastColorAdded(newLength: number) {
  // CAMBIO: Verificar que el color no sea null/undefined
  const lastColor = this.vm.gameStatus()?.lastColorAdded;
  if (!lastColor) return; // Si no hay color, salir

  // Agregar al localStorage
  const currentSequence = this.vm.myLocalSequence();
  const newSequence = [...currentSequence, lastColor]; // lastColor ya está verificado

  this.vm.setMyLocalSequence(newSequence);
  this.saveSequenceToStorage('my', newSequence);

  // Mostrar notificación
  this.toastr.info(`🎯 ${this.vm.gameStatus()?.opponentName} agregó ${lastColor.toUpperCase()} a tu secuencia`, 'Nuevo color');
}


  updateLocalSequences(status: SimonSayGameStatusResponse) {
    // Si mi secuencia cambió de longitud, actualizar desde el localStorage
    if (status.mySequenceLength !== this.vm.myLocalSequence().length) {
      const stored = this.getStoredSequence('my');
      if (stored.length === status.mySequenceLength) {
        this.vm.setMyLocalSequence(stored);
      } else if (status.mySequence) {
        // Si el backend envía la secuencia completa, usarla
        this.vm.setMyLocalSequence(status.mySequence);
        this.saveSequenceToStorage('my', status.mySequence);
      }
    }

    // Si la secuencia del oponente cambió, actualizar
    if (status.opponentSequenceLength !== this.vm.opponentLocalSequence().length) {
      const stored = this.getStoredSequence('opponent');
      if (stored.length === status.opponentSequenceLength) {
        this.vm.setOpponentLocalSequence(stored);
      } else if (status.opponentSequence) {
        this.vm.setOpponentLocalSequence(status.opponentSequence);
        this.saveSequenceToStorage('opponent', status.opponentSequence);
      }
    }

    // Actualizar progreso actual
    this.vm.setCurrentProgress(status.myCurrentProgress || 0);
  }

  handleOpponentTurn(status: SimonSayGameStatusResponse) {
    this.vm.setCanInteract(false);
    this.vm.setShowColorPicker(false);
  }

handleMyTurn(status: SimonSayGameStatusResponse) {
    switch (status.phase) {
      case 'choose_first_color':
        this.modalTitle = 'Primer color';
        this.modalSubtitle = 'Escoge el primer color para la secuencia de tu oponente';
        this.vm.setShowColorPicker(true);
        this.vm.setCanInteract(false);
        this.hasShownCurrentSequence = false; // Reset del flag
        break;

      case 'repeat_sequence':
        this.vm.setShowColorPicker(false);
        
        // CAMBIO: Solo animar si no estamos ya animando Y no hemos mostrado esta secuencia
        if (!this.isAnimatingSequence && !this.hasShownCurrentSequence) {
          this.startSequenceAnimation();
        }
        break;

      case 'choose_color':
        this.modalTitle = 'Agregar color';
        this.modalSubtitle = 'Escoge el siguiente color para la secuencia de tu oponente';
        this.vm.setShowColorPicker(true);
        this.vm.setCanInteract(false);
        this.hasShownCurrentSequence = false; // Reset del flag
        break;
    }
  }

  // === ANIMACIÓN DE SECUENCIA (CORREGIDA) ===

  startSequenceAnimation() {
    // CAMBIO: Verificar que no estemos ya animando
    if (this.isAnimatingSequence) {
      console.log('Animation already in progress, skipping');
      return;
    }

    const sequence = this.vm.myLocalSequence();

    console.log('Starting sequence animation with:', sequence);

    if (sequence.length === 0) {
      console.warn('No sequence found in localStorage, cannot animate');
      this.toastr.warning('No hay secuencia para mostrar');
      this.vm.setCanInteract(true);
      return;
    }

    // CAMBIO: Marcar que estamos animando y que ya mostramos esta secuencia
    this.isAnimatingSequence = true;
    this.hasShownCurrentSequence = true;
    
    this.vm.setShowingSequence(true);
    this.vm.setCanInteract(false);

    this.toastr.info(`Mostrando secuencia de ${sequence.length} colores`);
    this.animateSequence(sequence, 0);
  }

  animateSequence(sequence: string[], index: number) {
    if (index >= sequence.length) {
      // CAMBIO: Al terminar, limpiar flags y habilitar interacción
      this.isAnimatingSequence = false;
      this.vm.setShowingSequence(false);
      this.vm.setCanInteract(true);
      this.vm.setCurrentProgress(0); // Reset del progreso para empezar a repetir
      
      this.toastr.success('¡Ahora repite la secuencia!', '', { timeOut: 2000 });
      return;
    }

    const color = sequence[index];
    console.log(`Illuminating color ${index + 1}/${sequence.length}: ${color}`);
    
    this.illuminateColor(color);

    // CAMBIO: Usar setTimeout más claro
    setTimeout(() => {
      this.animateSequence(sequence, index + 1);
    }, this.sequenceSpeed);
  }

  illuminateColor(color: string) {
    const colorElement = document.querySelector(`[data-color="${color}"]`) as HTMLElement;
    if (colorElement) {
      // CAMBIO: Limpiar clases antes de agregar la nueva
      colorElement.classList.remove('illuminated', 'correct-flash', 'error-flash');
      
      // Agregar la clase de iluminación
      colorElement.classList.add('illuminated');
      
      // CAMBIO: Remover la clase después del tiempo especificado
      setTimeout(() => {
        colorElement.classList.remove('illuminated');
      }, this.sequenceSpeed * 0.6); // Un poco menos tiempo para que no se sobrepongan
    }
  }

  // === INTERACCIONES DEL JUGADOR (CORREGIDA) ===

  onColorClick(color: string) {
    // CAMBIO: Verificar que no estemos animando
    if (!this.vm.canInteract() || this.vm.showingSequence() || this.isProcessingColor || this.isAnimatingSequence) {
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
          this.illuminateColorSuccess(color);

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
        this.illuminateColorError(color);
        this.toastr.error(`❌ ¡Incorrecto! Era ${expectedColor.toUpperCase()}`, 'Game Over');
        // No habilitar interacción en error, el juego debería terminar
      }
    });
  }

  // CAMBIO: Mejorar las animaciones de feedback
  illuminateColorSuccess(color: string) {
    const colorElement = document.querySelector(`[data-color="${color}"]`) as HTMLElement;
    if (colorElement) {
      colorElement.classList.remove('illuminated', 'error-flash');
      colorElement.classList.add('correct-flash');
      setTimeout(() => {
        colorElement.classList.remove('correct-flash');
      }, 800);
    }
  }

  illuminateColorError(color: string) {
    const colorElement = document.querySelector(`[data-color="${color}"]`) as HTMLElement;
    if (colorElement) {
      colorElement.classList.remove('illuminated', 'correct-flash');
      colorElement.classList.add('error-flash');
      setTimeout(() => {
        colorElement.classList.remove('error-flash');
      }, 800);
    }
  }
  onColorChosenForOpponent(chosenColor: string) {
  const isFirstColor = this.vm.currentPhase() === 'choose_first_color';

  console.log('=== COLOR CHOSEN DEBUG ===');
  console.log('Color chosen:', chosenColor);
  console.log('Type:', typeof chosenColor);
  console.log('Available colors:', this.vm.myCustomColors());
  console.log('========================');

  const endpoint = isFirstColor
    ? this.simonSayService.chooseFirstColor(this.vm.gameId(), chosenColor)
    : this.simonSayService.chooseColor(this.vm.gameId(), chosenColor);

  endpoint.subscribe({
    next: (response) => {
      this.vm.setShowColorPicker(false);

      // Agregar color a la secuencia del oponente localmente
      const newOpponentSequence = [...this.vm.opponentLocalSequence(), chosenColor];
      this.vm.setOpponentLocalSequence(newOpponentSequence);
      this.saveSequenceToStorage('opponent', newOpponentSequence);

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

  saveSequenceToStorage(type: 'my' | 'opponent', sequence: string[]) {
    localStorage.setItem(`simonsay_${this.vm.gameId()}_${type}_sequence`, JSON.stringify(sequence));
  }

  getStoredSequence(type: 'my' | 'opponent'): string[] {
    const stored = localStorage.getItem(`simonsay_${this.vm.gameId()}_${type}_sequence`);
    return stored ? JSON.parse(stored) : [];
  }

  loadSequencesFromStorage() {
    this.vm.setMyLocalSequence(this.getStoredSequence('my'));
    this.vm.setOpponentLocalSequence(this.getStoredSequence('opponent'));
  }

  clearSequencesFromStorage() {
    localStorage.removeItem(`simonsay_${this.vm.gameId()}_my_sequence`);
    localStorage.removeItem(`simonsay_${this.vm.gameId()}_opponent_sequence`);
  }

  // === FIN DEL JUEGO ===

  handleGameEnd(status: SimonSayGameStatusResponse) {
    if (this.showEndModal) return;

    this.isWinner = status.winner === this.vm.myUserId();
    this.winnerName = status.winnerName || 'Desconocido';
    this.loserName = status.loserName || 'Desconocido';

    this.showEndModal = true;
    this.stopPolling();
    this.clearSequencesFromStorage();
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
