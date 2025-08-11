import { signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SimonSayGameStatusResponse } from '../models/simonsay.model';

export class SimonSayGameViewModel {
  private _gameStatus = signal<SimonSayGameStatusResponse | null>(null);
  private _gameId = signal<string>('');
  private _isLoading = signal<boolean>(true);
  private _errorMessage = signal<string | null>(null);
  private _myLocalSequence = signal<string[]>([]);
  private _currentProgress = signal<number>(0);
  private _canInteract = signal<boolean>(false);
  private _showColorPicker = signal<boolean>(false);

  // ELIMINAR estas que ya no se usan:
  // private _opponentLocalSequence = signal<string[]>([]);
  // private _showingSequence = signal<boolean>(false);
  // private _lastShownSequenceVersion = signal<number>(0);

  constructor(private authService: AuthService) {}

  // Getters públicos (readonly)
  gameStatus = computed(() => this._gameStatus());
  gameId = computed(() => this._gameId());
  isLoading = computed(() => this._isLoading());
  errorMessage = computed(() => this._errorMessage());
  myLocalSequence = computed(() => this._myLocalSequence());
  currentProgress = computed(() => this._currentProgress());
  canInteract = computed(() => this._canInteract());
  showColorPicker = computed(() => this._showColorPicker());

  // Estados derivados del juego
  myUserId = computed(() => Number(this.authService.getUserId()));
  isMyTurn = computed(() => this.gameStatus()?.isMyTurn || false);
  currentPhase = computed(() => this.gameStatus()?.phase || 'unknown');
  mySequenceLength = computed(() => this.myLocalSequence().length);

  currentPhaseText = computed(() => {
    const status = this.gameStatus();
    if (!status) return 'Cargando...';

    const isMyTurn = status.isMyTurn;
    const phase = status.phase;
    const opponentName = status.opponentName || 'Oponente';

    if (status.status === 'started' && phase === 'unknown') {
      return '🎮 Iniciando partida...';
    }

    if (isMyTurn) {
      switch (phase) {
        case 'choose_first_color':
          return '🎨 Tu turno: Escoge el primer color';
        case 'repeat_sequence':
          return '🔄 Tu turno: Repite la secuencia';
        case 'choose_next_color':
          return '🎨 Tu turno: Agrega un color';
        default:
          return '🎯 Tu turno';
      }
    } else {
      switch (phase) {
        case 'choose_first_color':
        case 'wait_opponent_choose':
          return `⏳ ${opponentName} escogiendo color`;
        case 'repeat_sequence':
        case 'wait_opponent_repeat':
          return `⏳ ${opponentName} repitiendo secuencia`;
        case 'choose_next_color':
          return `⏳ ${opponentName} agregando color`;
        default:
          return `⏳ Turno de ${opponentName}`;
      }
    }
  });

  getLastAddedColor(): string | null {
    const status = this.gameStatus();
    if (!status) return null;
    
    // Si hay un lastAddedColor en el status, usarlo
    if (status.lastAddedColor) {
      return status.lastAddedColor;
    }
    
    // Si no, obtener el último de la secuencia global
    const sequence = status.globalSequence;
    if (!sequence || sequence.length === 0) return null;
    
    return sequence[sequence.length - 1];
  }

  // MODIFICAR: Solo mostrar información del último color, no toda la secuencia
  shouldShowLastColor(): boolean {
    const status = this.gameStatus();
    if (!status) return false;
    
    // Mostrar solo cuando el oponente acaba de agregar un color
    return status.phase === 'wait_opponent_repeat' || 
           status.phase === 'wait_opponent_choose' ||
           (status.phase === 'repeat_sequence' && this.getLastAddedColor() !== null);
  }

  getExpectedColor(): string | null {
    const sequence = this.myLocalSequence();
    const progress = this.currentProgress();
    return sequence[progress] || null;
  }

  // Setters
  setGameId(id: string) { this._gameId.set(id); }
  setLoading(loading: boolean) { this._isLoading.set(loading); }
  setGameStatus(status: SimonSayGameStatusResponse) { this._gameStatus.set(status); }
  setMyLocalSequence(sequence: string[]) { this._myLocalSequence.set(sequence); }
  setCurrentProgress(progress: number) { this._currentProgress.set(progress); }
  setCanInteract(canInteract: boolean) { this._canInteract.set(canInteract); }
  setShowColorPicker(show: boolean) { this._showColorPicker.set(show); }

  // ELIMINAR estos métodos que ya no se usan:
  // setOpponentLocalSequence()
  // setShowingSequence()
  // opponentLocalSequence()
  // showingSequence()
}
