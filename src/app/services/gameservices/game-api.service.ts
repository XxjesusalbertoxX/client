import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment.prod';
import {
  CreateGameResponse,
  JoinGameResponse,
  LobbyStatusResponse,
  MessageResponse,
  StartGameResponse,
  RematchResponse,
} from '../../models/game.model'

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private _gameId = signal<string | null>(null);

  // private readonly baseURL = 'http://www.atenasoficial.com:3333';
  // private readonly baseURL = 'http://192.168.1.30:3333'
  // private readonly baseURL = 'http://127.0.0.1:3333'; // Uncomment for local development
  private readonly baseURL = environment.apiUrl; // Use environment variable for API URL

  constructor(private http: HttpClient) {}

  createGame(gameType: string): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.baseURL}/game/${gameType}/create`, {});
  }

  joinGame(code: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${this.baseURL}/game/join`, { code });
  }

  setReady(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/game/${gameId}/ready`, {});
  }

  getLobbyStatus(gameId: string): Observable<LobbyStatusResponse> {
    return this.http.get<LobbyStatusResponse>(`${this.baseURL}/game/${gameId}/lobby-status`);
  }

  startGame(gameId: string): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.baseURL}/game/${gameId}/start`, {});
  }

  // UNIFICADO: Un solo método para salir del juego
  leaveGame(gameId: string): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/game/${gameId}/leave`, {});
  }

  heartbeat(gameId: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseURL}/game/${gameId}/heartbeat`, {});
  }

  requestRematch(gameId: string): Observable<RematchResponse> {
    return this.http.post<RematchResponse>(`${this.baseURL}/game/${gameId}/rematch`, {});
  }

  setGameId(id: string) {
    this._gameId.set(id);
  }
}
