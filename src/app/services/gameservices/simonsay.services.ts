import { Injectable } from '@angular/core';
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
} from '../../models/game.model';
import {
  SimonSayGameStatusResponse,
} from '../../pages/practica-4-simon-say/models/simonsay.model';

@Injectable({ providedIn: 'root' })
export class SimonSayService {
  private readonly baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createGame(): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.baseURL}/game/simonsay/create`, {});
  }

  createGameWithColors(colors: string[]): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.baseURL}/game/simonsay/create`, {
      customColors: colors // <-- CAMBIA aquí el nombre
    });
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

  // Estado del juego SimonSay
  getGameStatus(gameId: string): Observable<SimonSayGameStatusResponse> {
    return this.http.get<SimonSayGameStatusResponse>(`${this.baseURL}/game/${gameId}/status`);
  }

  // Escoger el primer color para la secuencia del oponente
  chooseFirstColor(gameId: string, chosenColor: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/choose-first-color`, { chosenColor });
  }

  // Repetir/validar un color de MI secuencia
  playColor(gameId: string, color: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/play-color`, { color });
  }

  // Agregar color a la secuencia del oponente
  chooseColor(gameId: string, chosenColor: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/simonsay/${gameId}/choose-color`, { chosenColor });
  }

  // Salir del juego (usando el servicio genérico)
  leaveGame(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseURL}/game/${gameId}/leave`, {});
  }

  requestRematch(gameId: string): Observable<RematchResponse> {
    return this.http.post<RematchResponse>(`${this.baseURL}/game/${gameId}/rematch`, {});
  }
}
