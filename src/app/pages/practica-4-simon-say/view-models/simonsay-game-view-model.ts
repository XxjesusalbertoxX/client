import { Signal, signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SimonSayGameStatusResponse, SimonSayPhase } from '../models/simonsay.model';

export class SimonSayGameViewModel {
  // Estado interno (private signals)
  private _gameStatus = signal<SimonSayGameStatusResponse | null>(null);
  private _gameId = signal<string>('');
  private _isLoading = signal<boolean>(true);
  private _errorMessage = signal<string | null>(null);
  private _myLocalSequence = signal<string[]>([]);
  private _opponentLocalSequence = signal<string[]>([]);
  private _currentProgress = signal<number>(0);
  private _showingSequence = signal<boolean>(false);
  private _canInteract = signal<boolean>(false);
  private _showColorPicker = signal<boolean>(false);

  // Estado público (computed)
  myColors = computed(() => this.gameStatus()?.myColors || []);
  
  // Los colores que YO elegí (para escoger colores para el oponente)
  myCustomColors = computed(() => this.gameStatus()?.myCustomColors || []);
  
  // Los colores del tablero del oponente (los que yo elegí para él)
  opponentColors = computed(() => this.gameStatus()?.opponentColors || []);

  readonly gameStatus: Signal<SimonSayGameStatusResponse | null> = computed(() => this._gameStatus());
  readonly gameId: Signal<string> = computed(() => this._gameId());
  readonly isLoading: Signal<boolean> = computed(() => this._isLoading());
  readonly errorMessage: Signal<string | null> = computed(() => this._errorMessage());
  readonly myLocalSequence: Signal<string[]> = computed(() => this._myLocalSequence());
  readonly opponentLocalSequence: Signal<string[]> = computed(() => this._opponentLocalSequence());
  readonly currentProgress: Signal<number> = computed(() => this._currentProgress());
  readonly showingSequence: Signal<boolean> = computed(() => this._showingSequence());
  readonly canInteract: Signal<boolean> = computed(() => this._canInteract());
  readonly showColorPicker: Signal<boolean> = computed(() => this._showColorPicker());

  
  // Computed properties específicos del juego
  readonly isMyTurn: Signal<boolean> = computed(() => {
    const status = this._gameStatus();
    return status?.isMyTurn || false;
  });

  readonly currentPhase: Signal<SimonSayPhase | null> = computed(() => {
    const status = this._gameStatus();
    return status?.phase || null;
  });

  // readonly myColors: Signal<string[]> = computed(() => {
  //   const status = this._gameStatus();
  //   return status?.myColors || [];
  // });

  // readonly opponentColors: Signal<string[]> = computed(() => {
  //   const status = this._gameStatus();
  //   return status?.opponentColors || [];
  // });

  readonly mySequenceLength: Signal<number> = computed(() => {
    const status = this._gameStatus();
    return status?.mySequenceLength || 0;
  });

  readonly opponentSequenceLength: Signal<number> = computed(() => {
    const status = this._gameStatus();
    return status?.opponentSequenceLength || 0;
  });

  readonly currentPhaseText: Signal<string> = computed(() => {
    const status = this._gameStatus();
    if (!status) return '';
    
    if (status.isMyTurn) {
      switch (status.phase) {
        case 'choose_first_color':
          return 'Escoge el primer color para tu oponente';
        case 'repeat_sequence':
          return 'Repite tu secuencia';
        case 'choose_color':
          return 'Escoge un color para agregar a la secuencia del oponente';
        default:
          return 'Tu turno';
      }
    } else {
      return 'Turno del oponente';
    }
  });

  readonly isGameFinished: Signal<boolean> = computed(() => {
    const status = this._gameStatus();
    return status?.status === 'finished';
  });

  readonly myUserId: Signal<number> = computed(() => {
    return Number(this.authService.getUserId());
  });

  constructor(private authService: AuthService) {}

  // Métodos para actualizar el estado
  setGameStatus(status: SimonSayGameStatusResponse) {
    this._gameStatus.set(status);
    this._isLoading.set(false);
  }

  setGameId(id: string) {
    this._gameId.set(id);
  }

  setMyLocalSequence(sequence: string[]) {
    this._myLocalSequence.set([...sequence]);
  }

  setOpponentLocalSequence(sequence: string[]) {
    this._opponentLocalSequence.set([...sequence]);
  }

  setCurrentProgress(progress: number) {
    this._currentProgress.set(progress);
  }

  setShowingSequence(showing: boolean) {
    this._showingSequence.set(showing);
  }

  setCanInteract(canInteract: boolean) {
    this._canInteract.set(canInteract);
  }

  setShowColorPicker(show: boolean) {
    this._showColorPicker.set(show);
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setError(message: string | null) {
    this._errorMessage.set(message);
  }

  // Helpers
  getExpectedColor(): string | null {
    const sequence = this._myLocalSequence();
    const progress = this._currentProgress();
    return sequence[progress] || null;
  }

  isSequenceComplete(): boolean {
    const sequence = this._myLocalSequence();
    const progress = this._currentProgress();
    return progress >= sequence.length;
  }
}