import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BattleshipStatsResponse,
  BattleshipGameDetails,
} from '../../pages/practica-3-batalla-naval/models/battle-ship.model';

@Injectable({ providedIn: 'root' })
export class BattleshipStatsService {
  private readonly baseURL = 'http://192.168.1.30:3333/battleship/stats'; // Cambia si es necesario

  constructor(private http: HttpClient) {}

  getStats(): Observable<BattleshipStatsResponse> {
    // GET /stats/battleship
    return this.http.get<BattleshipStatsResponse>(`${this.baseURL}/games`);
  }

  getGameDetails(gameId: string): Observable<BattleshipGameDetails> {
    // GET /stats/battleship/:id
    return this.http.get<BattleshipGameDetails>(`${this.baseURL}/game/${gameId}`);
  }
}
