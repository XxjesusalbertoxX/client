import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import {
  CreateGameResponse,
  LobbyStatusResponse,
  MessageResponse,
  AttackResponse,
  GameStatusResponse,
  JoinGameResponse,
  StartGameResponse
} from '../pages/practica-3-batalla-naval/models/battle-ship.model'

@Injectable({ providedIn: 'root' })
export class BattleShipService {
  private _gameId = signal<string | null>(null)
  private readonly baseURL = 'http://localhost:3333'
  private readonly prefixGames = this.baseURL+'/game'
  private readonly prefixBattleShip = this.baseURL+'/battleship'

  constructor(private http: HttpClient) {}
  startGame(gameId: string): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.prefixBattleShip}/${gameId}/start`, {})
  }

  createGame(data: { gameTypeId: number }): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.prefixGames}/create`, data)
  }

  joinGame(code: string): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(`${this.prefixGames}/join`, { code });
  }

  markReady(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixGames}/${gameId}/ready`, {})
  }

  attack(gameId: string, data: { x: number; y: number }): Observable<AttackResponse> {
    return this.http.post<AttackResponse>(`${this.prefixGames}/${gameId}/attack`, data)
  }

  getGameStatus(gameId: string): Observable<GameStatusResponse> {
    return this.http.get<GameStatusResponse>(`${this.prefixGames}/${gameId}/status`)
  }

  getLobbyStatus(gameId: string): Observable<LobbyStatusResponse> {
    return this.http.get<LobbyStatusResponse>(`${this.prefixGames}/${gameId}/lobby-status`)
  }

  surrender(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixGames}/${gameId}/surrender`, {})
  }

  heartbeat(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.prefixBattleShip}/${gameId}/heartbeat`, {})
  }

  setGameId(id: string) {
    this._gameId.set(id)
  }

  get gameId() {
    return this._gameId()
  }
}
