import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateGameResponse,
  LobbyStatusResponse,
  MessageResponse,
  AttackResponse,
  GameStatusResponse,
  JoinGameResponse,
  StartGameResponse,
  RematchResponse,
} from '../pages/practica-3-batalla-naval/models/battle-ship.model';

@Injectable({ providedIn: 'root' })
export class BattleShipService {
  private _gameId = signal<string | null>(null);
  // private readonly baseURL = 'http://localhost:3333';
  private readonly baseURL = 'http://192.168.1.30:3333';

  constructor(private http: HttpClient) {}

  // --- GAME ROUTES ---
  createGame(gameType: string): Observable<CreateGameResponse> {
    // POST /game/:gameType/create
    return this.http.post<CreateGameResponse>(`${this.baseURL}/game/${gameType}/create`, {});
  }

  joinGame(code: string): Observable<JoinGameResponse> {
    // POST /game/join
    return this.http.post<JoinGameResponse>(`${this.baseURL}/game/join`, { code });
  }

  setReady(gameId: string): Observable<MessageResponse> {
    // POST /game/:id/ready
    return this.http.post<MessageResponse>(`${this.baseURL}/game/${gameId}/ready`, {});
  }

  getLobbyStatus(gameId: string): Observable<LobbyStatusResponse> {
    // GET /game/:id/lobby-status
    return this.http.get<LobbyStatusResponse>(`${this.baseURL}/game/${gameId}/lobby-status`);
  }

  getGameStatus(gameId: string): Observable<GameStatusResponse> {
    // GET /game/:id/status
    return this.http.get<GameStatusResponse>(`${this.baseURL}/game/${gameId}/status`);
  }

  startGame(gameId: string): Observable<StartGameResponse> {
    // POST /game/:id/start
    console.log('Iniciando partida:', gameId);
    return this.http.post<StartGameResponse>(`${this.baseURL}/game/${gameId}/start`, {});
  }

  leaveGame(gameId: string): Observable<MessageResponse> {
    // POST /game/:id/leave
    return this.http.post<MessageResponse>(`${this.baseURL}/game/${gameId}/leave`, {});
  }

  // --- BATTLESHIP ROUTES ---
  attack(gameId: string, x: number, y: number): Observable<AttackResponse> {
    // POST /battleship/:id/attack/:x/:y
    return this.http.post<AttackResponse>(`${this.baseURL}/battleship/${gameId}/attack/${x}/${y}`, {});
  }

  surrender(gameId: string): Observable<MessageResponse> {
    // POST /battleship/:id/surrender
    return this.http.post<MessageResponse>(`${this.baseURL}/battleship/${gameId}/surrender`, {});
  }

  heartbeat(gameId: string): Observable<MessageResponse> {
    // POST /battleship/:id/heartbeat
    return this.http.patch<MessageResponse>(`${this.baseURL}/game/${gameId}/heartbeat`, {});
  }

  requestRematch(gameId: string): Observable<RematchResponse> {
    // POST /game/:id/rematch
    return this.http.post<RematchResponse>(`${this.baseURL}/game/${gameId}/rematch`, {});
  }

  // --- UTILS ---
  setGameId(id: string) {
    this._gameId.set(id);
  }

  get gameId() {
    return this._gameId();
  }
}
