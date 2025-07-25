import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval, Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { SimonSayGameStatusResponse } from '../../models/simonsay.model';
import { ColorPickerModalComponent } from '../../components/color-picker-modal/color-picker-modal.component';
import { SimonSayGameViewModel } from '../../view-models/simonsay-game-view-model';

@Component({
  standalone: true,
  selector: 'app-simonsay-game',
  imports: [CommonModule, ColorPickerModalComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private statusSubscription?: Subscription;
  private heartbeatSubscription?: Subscription;

  // Servicios
  private authService = inject(AuthService);
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

  sequenceSpeed = 800; // ms entre colores

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
    this.vm.setGameStatus(status);

    if (status.status === 'finished') {
      this.handleGameEnd(status);
      return;
    }

    // Actualizar secuencias locales si han cambiado
    this.updateLocalSequences(status);

    // Manejar diferentes fases del juego
    if (status.isMyTurn) {
      this.handleMyTurn(status);
    } else {
      this.handleOpponentTurn(status);
    }
  }

  updateLocalSequences(status: SimonSayGameStatusResponse) {
    // Si mi secuencia cambió de longitud, actualizar
    if (status.mySequenceLength !== this.vm.myLocalSequence().length) {
      const stored = this.getStoredSequence('my');
      if (stored.length === status.mySequenceLength) {
        this.vm.setMyLocalSequence(stored);
      }
    }

    // Si la secuencia del oponente cambió, actualizar
    if (status.opponentSequenceLength !== this.vm.opponentLocalSequence().length) {
      const stored = this.getStoredSequence('opponent');
      if (stored.length === status.opponentSequenceLength) {
        this.vm.setOpponentLocalSequence(stored);
      }
    }

    // Actualizar progreso actual
    this.vm.setCurrentProgress(status.myCurrentProgress || 0);
  }

  handleMyTurn(status: SimonSayGameStatusResponse) {
    switch (status.phase) {
      case 'choose_first_color':
        this.vm.setShowColorPicker(true);
        this.vm.setCanInteract(false);
        break;
        
      case 'repeat_sequence':
        this.startSequenceAnimation();
        break;
        
      case 'choose_color':
        this.vm.setShowColorPicker(true);
        this.vm.setCanInteract(false);
        break;
    }
  }

  handleOpponentTurn(status: SimonSayGameStatusResponse) {
    this.vm.setCanInteract(false);
    this.vm.setShowColorPicker(false);
  }

  // === ANIMACIÓN DE SECUENCIA ===

  startSequenceAnimation() {
    const sequence = this.vm.myLocalSequence();
    if (sequence.length === 0) return;
    
    this.vm.setShowingSequence(true);
    this.vm.setCanInteract(false);
    
    this.animateSequence(sequence, 0);
  }

  animateSequence(sequence: string[], index: number) {
    if (index >= sequence.length) {
      this.vm.setShowingSequence(false);
      this.vm.setCanInteract(true);
      this.vm.setCurrentProgress(0);
      return;
    }

    const color = sequence[index];
    this.illuminateColor(color);

    setTimeout(() => {
      this.animateSequence(sequence, index + 1);
    }, this.sequenceSpeed);
  }

  illuminateColor(color: string) {
    const colorElement = document.querySelector(`[data-color="${color}"]`);
    if (colorElement) {
      colorElement.classList.add('illuminated');
      setTimeout(() => {
        colorElement.classList.remove('illuminated');
      }, this.sequenceSpeed * 0.7);
    }
  }

  // === INTERACCIONES DEL JUGADOR ===

  onColorClick(color: string) {
    if (!this.vm.canInteract() || this.vm.showingSequence()) return;

    const expectedColor = this.vm.getExpectedColor();
    
    if (color === expectedColor) {
      // Color correcto
      const newProgress = this.vm.currentProgress() + 1;
      this.vm.setCurrentProgress(newProgress);
      this.illuminateColor(color);
      
      // Enviar al backend
      this.simonSayService.playColor(this.vm.gameId(), color).subscribe({
        next: (response: any) => {
          if (response.sequenceCompleted) {
            this.vm.setCanInteract(false);
            this.vm.setShowColorPicker(true);
          }
        },
        error: (error) => {
          this.toastr.error('Error al validar color');
          console.error('Error:', error);
        }
      });
    } else {
      // Color incorrecto
      this.simonSayService.playColor(this.vm.gameId(), color).subscribe({
        error: (error) => {
          console.error('Game over:', error);
        }
      });
    }
  }

  onColorChosenForOpponent(chosenColor: string) {
    const isFirstColor = this.vm.currentPhase() === 'choose_first_color';
    
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
        
        this.toastr.success('Color agregado a la secuencia del oponente');
      },
      error: (error) => {
        this.toastr.error('Error al escoger color');
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

  onLeaveGame() {
    this.simonSayService.leaveGame(this.vm.gameId()).subscribe({
      complete: () => {
        this.router.navigate(['/games/simonsay']);
      }
    });
  }

  onRematch() {
    this.simonSayService.requestRematch(this.vm.gameId()).subscribe({
      next: (response: any) => {
        if (response.rematchStarted) {
          this.router.navigate(['/games/simonsay/lobby'], {
            queryParams: { id: response.gameId }
          });
        } else {
          this.rematchRequested = true;
          this.toastr.info('Solicitud de revancha enviada');
        }
      },
      error: (error) => {
        this.toastr.error('Error al solicitar revancha');
      }
    });
  }

  onNewGame() {
    this.router.navigate(['/games/simonsay']);
  }
}