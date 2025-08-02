import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateGameResponse,
  JoinGameResponse,
  LobbyStatusResponse,
  MessageResponse,
  StartGameResponse,
  RematchResponse,
} from '../../models/game.model';
import {
  SimonSayGameStatusResponse,
} from '../../pages/practica-4-simon-say/models/simonsay.model';

@Injectable({ providedIn: 'root' })
export class SimonSayService {
  private readonly baseURL = 'http://127.0.0.1:3333';
  // private readonly baseURL = 'http://192.168.1.30:3333';

  constructor(private http: HttpClient) {}

  createGame(): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.baseURL}/game/simonsay/create`, {});
  }

  joinGame(code: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${this.baseURL}/game/join`, { code });
  }

  setColors(gameId: string, colors: string[]): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/colors`, { colors });
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

  heartbeat(gameId: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.baseURL}/game/${gameId}/heartbeat`, {});
  }

  requestRematch(gameId: string): Observable<RematchResponse> {
    return this.http.post<RematchResponse>(`${this.baseURL}/game/${gameId}/rematch`, {});
  }

  // Estado del juego SimonSay
  getGameStatus(gameId: string): Observable<SimonSayGameStatusResponse> {
    return this.http.get<SimonSayGameStatusResponse>(`${this.baseURL}/game/${gameId}/status`);
  }

  // Escoger el primer color
  chooseFirstColor(gameId: string, chosenColor: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/choose-first-color`, { chosenColor });
  }

  // Validar un color de la secuencia
  playColor(gameId: string, color: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/play-color`, { color });
  }

  // Agregar color a la secuencia del oponente
  chooseColor(gameId: string, chosenColor: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/choose-color`, { chosenColor });
  }
}
