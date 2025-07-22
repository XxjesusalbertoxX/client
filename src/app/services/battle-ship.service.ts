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
} from '../pages/practica-3-batalla-naval/models/battle-ship.model';

@Injectable({ providedIn: 'root' })
export class BattleShipService {
  private _gameId = signal<string | null>(null);
  private readonly baseURL = 'http://localhost:3333';
  private readonly prefixGames = `${this.baseURL}/game`;
  private readonly prefixBattleShip = `${this.baseURL}/battleship`;

  constructor(private http: HttpClient) {}

  /**
   * Inicia una partida de Battleship
   * @param gameId ID de la partida
   * @returns Observable con la respuesta del inicio de la partida
   */
  startGame(gameId: string): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.prefixBattleShip}/${gameId}/start`, {});
  }

  /**
   * Crea una nueva partida
   * @param data Datos para crear la partida
   * @returns Observable con la respuesta de la creación
   */
  createGame(data: { gameTypeId: number }): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.prefixGames}/create`, data);
  }

  /**
   * Une a un jugador a una partida existente
   * @param code Código de la partida
   * @returns Observable con la respuesta de unirse a la partida
   */
  joinGame(code: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${this.prefixGames}/join`, { code });
  }

  /**
   * Marca al jugador como listo
   * @param gameId ID de la partida
   * @returns Observable con un mensaje de confirmación
   */
  markReady(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixGames}/${gameId}/ready`, {});
  }

  /**
   * Realiza un ataque en la partida
   * @param gameId ID de la partida
   * @param data Coordenadas del ataque
   * @returns Observable con la respuesta del ataque
   */
  attack(gameId: string, data: { x: number; y: number }): Observable<AttackResponse> {
    return this.http.post<AttackResponse>(`${this.prefixBattleShip}/${gameId}/attack/${data.x}/${data.y}`, {});
  }

  /**
   * Obtiene el estado actual de la partida
   * @param gameId ID de la partida
   * @returns Observable con el estado de la partida
   */
  getGameStatus(gameId: string): Observable<GameStatusResponse> {
    return this.http.get<GameStatusResponse>(`${this.prefixGames}/${gameId}/status`);
  }

  /**
   * Obtiene el estado del lobby de la partida
   * @param gameId ID de la partida
   * @returns Observable con el estado del lobby
   */
  getLobbyStatus(gameId: string): Observable<LobbyStatusResponse> {
    return this.http.get<LobbyStatusResponse>(`${this.prefixGames}/${gameId}/lobby-status`);
  }

  /**
   * Marca la rendición del jugador
   * @param gameId ID de la partida
   * @returns Observable con un mensaje de confirmación
   */
  surrender(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixBattleShip}/${gameId}/surrender`, {});
  }

  /**
   * Envía un latido (heartbeat) para mantener la conexión activa
   * @param gameId ID de la partida
   * @returns Observable con un mensaje de confirmación
   */
  heartbeat(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixBattleShip}/${gameId}/heartbeat`, {});
  }

  /**
   * Establece el ID de la partida actual
   * @param id ID de la partida
   */
  setGameId(id: string) {
    this._gameId.set(id);
  }

  /**
   * Obtiene el ID de la partida actual
   * @returns ID de la partida
   */
  get gameId() {
    return this._gameId();
  }
}
