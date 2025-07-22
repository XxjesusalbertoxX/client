import { Signal, signal, computed } from '@angular/core';

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

  // Estado público (para la vista)
  readonly myBoard: Signal<number[][]> = computed(() => this._myBoard());
  readonly enemyBoard: Signal<number[][]> = computed(() => this._enemyBoard());
  readonly gameStatus: Signal<string> = computed(() => this._gameStatus());
  readonly isLoading: Signal<boolean> = computed(() => this._isLoading());
  readonly errorMessage: Signal<string | null> = computed(() => this._errorMessage());
  readonly isMyTurn: Signal<boolean> = computed(() =>
    this._currentTurnUserId() === this._myUserId()
  );

  // Métodos para actualizar el estado
  setGameData(gameData: any) {
    if (!gameData) return;

    this._myBoard.set(gameData.myBoard || []);
    this._enemyBoard.set(gameData.enemyBoard || []);
    this._currentTurnUserId.set(gameData.currentTurnUserId);
    this._gameStatus.set(gameData.status);

    // Solo actualiza myUserId si no estaba establecido antes
    if (gameData.players && this._myUserId() === null) {
      const myPlayer = gameData.players.find((p: any) => p.is_self);
      if (myPlayer) {
        this._myUserId.set(myPlayer.userId);
      }
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
