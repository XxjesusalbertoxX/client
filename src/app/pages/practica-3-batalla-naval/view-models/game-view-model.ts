import { Signal, signal, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

export class GameViewModel {
  // Estado interno (model)
  private _myBoard = signal<number[][]>([]);
  private _enemyBoard = signal<number[][]>([]);
  private _currentTurnUserId = signal<number | null>(null);
  private _myUserId = signal<number | null>(null);
  private _gameId = signal<string | null>(null);
  private _gameStatus = signal<'waiting' | 'started' | 'in_progress' | 'finished'>('waiting');
  private _isLoading = signal<boolean>(true);
  private _errorMessage = signal<string | null>(null);
  private _players = signal<any[]>([]);
  private _opponentName = signal<string>('');
  private _myShipsRemaining = signal<number>(0);
  private _enemyShipsRemaining = signal<number>(0);

  
  
  // Estado público (para la vista)
  readonly myShipsRemaining: Signal<number> = computed(() => this._myShipsRemaining());
  readonly enemyShipsRemaining: Signal<number> = computed(() => this._enemyShipsRemaining());
  readonly myBoard: Signal<number[][]> = computed(() => this._myBoard());
  readonly enemyBoard: Signal<number[][]> = computed(() => this._enemyBoard());
  readonly gameStatus: Signal<string> = computed(() => this._gameStatus());
  readonly isLoading: Signal<boolean> = computed(() => this._isLoading());
  readonly errorMessage: Signal<string | null> = computed(() => this._errorMessage());
  readonly players: Signal<any[]> = computed(() => this._players());
  readonly opponentName: Signal<string> = computed(() => this._opponentName());
  readonly isMyTurn: Signal<boolean> = computed(() => {
    const turnId = Number(this._currentTurnUserId());
    const myId = Number(this._myUserId());
    console.log('isMyTurn computed called', turnId, myId, turnId === myId);
    return turnId === myId;
  });
  
  constructor(private authService: AuthService) {
    this._myUserId.set(Number(this.authService.getUserId()));
  }

  // Métodos para actualizar el estado
  setGameData(gameData: any) {
    if (!gameData) return;

    this._myBoard.set(gameData.myBoard || []);
    this._enemyBoard.set(gameData.enemyBoard || []);
    this._currentTurnUserId.set(Number(gameData.currentTurnUserId));
    this._gameStatus.set(gameData.status);
    this._players.set(gameData.players || []);
    
    // Usar contadores del backend
    this._myShipsRemaining.set(gameData.myShipsRemaining || 0);
    this._enemyShipsRemaining.set(gameData.enemyShipsRemaining || 0);
    
    // Encontrar nombre del oponente
    if (gameData.players) {
      const myUserId = Number(this.authService.getUserId());
      const opponent = gameData.players.find((p: any) => p.userId !== myUserId);
      this._opponentName.set(opponent?.user?.name || 'Oponente');
    }
    
    this._isLoading.set(false);
  }


  setGameId(id: string) {
    this._gameId.set(id);
  }

  getGameId(): string | null {
    return this._gameId();
  }

  setError(message: string) {
    this._errorMessage.set(message);
  }

}
