import { signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { 
  LoteriaLobbyStatusResponse, 
  LoteriaGameStatusResponse,
  LoteriaLobbyPlayer,
  LoteriaHost,
  LoteriaGameStatus 
} from '../models/loteria.model';

export class LoteriaViewModel {
  // Señales principales
  private _gameId = signal<string>('');
  private _gameCode = signal<string>('');
  private _lobbyStatus = signal<LoteriaLobbyStatusResponse | null>(null);
  private _gameStatus = signal<LoteriaGameStatusResponse | null>(null);
  private _isLoading = signal<boolean>(true);
  private _showSettingsModal = signal<boolean>(false);

  // Usuario actual
  private _userId: number;

  constructor(private authService: AuthService) {
    this._userId = Number(this.authService.getUserId());
  }

  // ========================================
  // GETTERS PÚBLICOS
  // ========================================

  // Básicos
  gameId = this._gameId.asReadonly();
  gameCode = this._gameCode.asReadonly();
  isLoading = this._isLoading.asReadonly();
  showSettingsModal = this._showSettingsModal.asReadonly();

  // Estado del lobby
  lobbyStatus = this._lobbyStatus.asReadonly();
  gameStatus = this._gameStatus.asReadonly();

  // ========================================
  // COMPUTED SIGNALS
  // ========================================

  // Información del lobby
  players = computed(() => this._lobbyStatus()?.players || []);
  host = computed(() => this._lobbyStatus()?.host);
  
  currentPlayers = computed(() => this._lobbyStatus()?.currentPlayers || 0);
  minPlayers = computed(() => this._lobbyStatus()?.minPlayers || 4);
  maxPlayers = computed(() => this._lobbyStatus()?.maxPlayers || 8);
  
  // Estados del usuario
  isHost = computed(() => this._lobbyStatus()?.isHost || false);
  myCardGenerated = computed(() => this._lobbyStatus()?.myCardGenerated || false);
  myReady = computed(() => this._lobbyStatus()?.myReady || false);
  canStart = computed(() => this._lobbyStatus()?.canStart || false);

  // Estados de progreso
  hasEnoughPlayers = computed(() => 
    this.currentPlayers() >= this.minPlayers()
  );

  allPlayersReady = computed(() => 
    this.players().length > 0 && 
    this.players().every(p => p.ready && p.cardGenerated)
  );

  gameCanStart = computed(() => 
    this.hasEnoughPlayers() && this.allPlayersReady() && this.isHost()
  );

  // Información del juego
  gameStatusEnum = computed<LoteriaGameStatus>(() => 
    this._gameStatus()?.status || this._lobbyStatus()?.status || 'waiting'
  );

  currentCard = computed(() => this._gameStatus()?.currentCard);
  cardsRemaining = computed(() => this._gameStatus()?.cardsRemaining || 0);

  // Información específica del usuario en el juego
  myCard = computed(() => {
    const status = this._gameStatus();
    return status && 'myCard' in status ? status.myCard : [];
  });

  myMarkedCells = computed(() => {
    const status = this._gameStatus();
    return status && 'myMarkedCells' in status ? status.myMarkedCells : [];
  });

  myTokensUsed = computed(() => {
    const status = this._gameStatus();
    return status && 'myTokensUsed' in status ? status.myTokensUsed : 0;
  });

  isSpectator = computed(() => {
    const status = this._gameStatus();
    return status && 'isSpectator' in status ? status.isSpectator : false;
  });

  // Vista del anfitrión
  hostView = computed(() => {
    const status = this._gameStatus();
    return status && 'hostView' in status ? status.hostView : null;
  });

  playersInfo = computed(() => {
    const status = this._gameStatus();
    return status && 'playersInfo' in status ? status.playersInfo : [];
  });

  // Estados del juego
  isInLobby = computed(() => 
    ['waiting', 'card_selection', 'ready_check'].includes(this.gameStatusEnum())
  );

  isInGame = computed(() => 
    ['in_progress', 'verification'].includes(this.gameStatusEnum())
  );

  isGameFinished = computed(() => 
    this.gameStatusEnum() === 'finished'
  );

  // ========================================
  // SETTERS
  // ========================================

  setGameId(id: string) {
    this._gameId.set(id);
  }

  setGameCode(code: string) {
    this._gameCode.set(code);
  }

  setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  setShowSettingsModal(show: boolean) {
    this._showSettingsModal.set(show);
  }

  setLobbyStatus(status: LoteriaLobbyStatusResponse) {
    this._lobbyStatus.set(status);
  }

  setGameStatus(status: LoteriaGameStatusResponse) {
    this._gameStatus.set(status);
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  getUserId(): number {
    return this._userId;
  }

  getMyPlayer(): LoteriaLobbyPlayer | undefined {
    return this.players().find(p => p.userId === this._userId);
  }

  isMyTurn(): boolean {
    // Para lotería, el anfitrión controla el flujo, no hay turnos individuales
    return this.isHost() && this.isInGame();
  }

  canGenerateCard(): boolean {
    return this.isInLobby() && !this.isHost() && !this.myCardGenerated();
  }

  canSetReady(): boolean {
    return this.isInLobby() && !this.isHost() && this.myCardGenerated() && !this.myReady();
  }

  canPlaceToken(row: number, col: number): boolean {
    if (this.isHost() || this.isSpectator() || !this.isInGame()) {
      return false;
    }

    const cellIndex = row * 4 + col;
    return !this.myMarkedCells()[cellIndex];
  }

  getCardAtPosition(row: number, col: number): string | undefined {
    if (this.isHost()) return undefined;
    
    const cellIndex = row * 4 + col;
    return this.myCard()[cellIndex];
  }

  isCellMarked(row: number, col: number): boolean {
    const cellIndex = row * 4 + col;
    return this.myMarkedCells()[cellIndex] || false;
  }

  // ========================================
  // MÉTODOS DE FORMATO
  // ========================================

  formatCardName(cardName: string): string {
    return cardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusText(): string {
    const status = this.gameStatusEnum();
    switch (status) {
      case 'waiting':
        return 'Esperando jugadores...';
      case 'card_selection':
        return 'Seleccionando cartas';
      case 'ready_check':
        return 'Preparándose para iniciar';
      case 'in_progress':
        return this.isHost() ? 'Controlando la partida' : 'Jugando...';
      case 'verification':
        return 'Verificando ganador...';
      case 'finished':
        return 'Partida finalizada';
      default:
        return 'Conectando...';
    }
  }

  getProgressText(): string {
    if (this.isHost()) {
      return `${this.currentPlayers()}/${this.maxPlayers()} jugadores`;
    }
    
    if (!this.myCardGenerated()) {
      return 'Genera tu carta';
    }
    
    if (!this.myReady()) {
      return 'Márcate como listo';
    }
    
    return 'Esperando inicio...';
  }
}