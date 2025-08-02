import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AttackResponse,
  GameStatusResponse,
  BattleshipStatsResponse,
  BattleshipGameDetails,
} from '../../pages/practica-3-batalla-naval/models/battle-ship.model';

@Injectable({ providedIn: 'root' })
export class BattleShipService {
  private _gameId = signal<string | null>(null);
  // private readonly baseURL = 'http://192.168.1.30:3333';
  private readonly baseURL = 'http://127.0.0.1:3333';

  constructor(private http: HttpClient) {}

  attack(gameId: string, x: number, y: number): Observable<AttackResponse> {
    return this.http.post<AttackResponse>(`${this.baseURL}/battleship/${gameId}/attack/${x}/${y}`, {});
  }

  surrender(gameId: string): Observable<any> {
    return this.http.post<any>(`${this.baseURL}/battleship/${gameId}/surrender`, {});
  }

  getGameStatus(gameId: string): Observable<GameStatusResponse> {
    return this.http.get<GameStatusResponse>(`${this.baseURL}/game/${gameId}/status`);
  }

  // Stats específicos de battleship
  getStats(): Observable<BattleshipStatsResponse> {
    return this.http.get<BattleshipStatsResponse>(`${this.baseURL}/stats/battleship`);
  }

  getGameDetails(gameId: string): Observable<BattleshipGameDetails> {
    return this.http.get<BattleshipGameDetails>(`${this.baseURL}/stats/battleship/${gameId}`);
  }

  setGameId(id: string) {
    this._gameId.set(id);
  }

  get gameId() {
    return this._gameId();
  }
}
