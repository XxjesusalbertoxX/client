import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
import {
  CreateLoteriaGameRequest,
  CreateLoteriaGameResponse,
  JoinGameRequest,
  JoinGameResponse,
  GenerateCardResponse,
  LoteriaLobbyStatusResponse,
  LoteriaGameStatusResponse,
  StartGameResponse,
  DrawCardResponse,
  ReshuffleCardsResponse,
  KickPlayerRequest,
  KickPlayerResponse,
  PlaceTokenRequest,
  PlaceTokenResponse,
  ClaimWinResponse,
  MessageResponse
} from '../../pages/practica-5-loteria/models/loteria.model';

@Injectable({
  providedIn: 'root'
})
export class LoteriaService {
  private apiUrl = 'http://127.0.0.1:3333/';
  // private apiUrl = environment.apiUrl || 'http://127.0.0.1:3333/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========================================
  // MÉTODOS PARA CREAR Y UNIRSE A PARTIDA
  // ========================================

  createGame(gameData: CreateLoteriaGameRequest): Observable<CreateLoteriaGameResponse> {
    return this.http.post<CreateLoteriaGameResponse>(
      `${this.apiUrl}/game/loteria/create`,
      gameData,
      { headers: this.getHeaders() }
    );
  }

  joinGame(joinData: JoinGameRequest): Observable<JoinGameResponse> {
    return this.http.post<JoinGameResponse>(
      `${this.apiUrl}/game/join`,
      joinData,
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS DE LOBBY
  // ========================================

  generateCard(gameId: string): Observable<GenerateCardResponse> {
    return this.http.post<GenerateCardResponse>(
      `${this.apiUrl}/loteria/${gameId}/generate-card`,
      {},
      { headers: this.getHeaders() }
    );
  }

  setReady(gameId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/game/${gameId}/ready`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getLobbyStatus(gameId: string): Observable<LoteriaLobbyStatusResponse> {
    return this.http.get<LoteriaLobbyStatusResponse>(
      `${this.apiUrl}/game/${gameId}/lobby-status`,
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS DE JUEGO
  // ========================================

  startGame(gameId: string): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(
      `${this.apiUrl}/game/${gameId}/start`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getGameStatus(gameId: string): Observable<LoteriaGameStatusResponse> {
    return this.http.get<LoteriaGameStatusResponse>(
      `${this.apiUrl}/game/${gameId}/status`,
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS PARA EL ANFITRIÓN
  // ========================================

  drawCard(gameId: string): Observable<DrawCardResponse> {
    return this.http.post<DrawCardResponse>(
      `${this.apiUrl}/loteria/${gameId}/draw-card`,
      {},
      { headers: this.getHeaders() }
    );
  }

  reshuffleCards(gameId: string): Observable<ReshuffleCardsResponse> {
    return this.http.post<ReshuffleCardsResponse>(
      `${this.apiUrl}/loteria/${gameId}/reshuffle`,
      {},
      { headers: this.getHeaders() }
    );
  }

  kickPlayer(gameId: string, kickData: KickPlayerRequest): Observable<KickPlayerResponse> {
    return this.http.post<KickPlayerResponse>(
      `${this.apiUrl}/loteria/${gameId}/kick-player`,
      kickData,
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS PARA JUGADORES
  // ========================================

  placeToken(gameId: string, tokenData: PlaceTokenRequest): Observable<PlaceTokenResponse> {
    return this.http.post<PlaceTokenResponse>(
      `${this.apiUrl}/loteria/${gameId}/place-token`,
      tokenData,
      { headers: this.getHeaders() }
    );
  }

  claimWin(gameId: string): Observable<ClaimWinResponse> {
    return this.http.post<ClaimWinResponse>(
      `${this.apiUrl}/loteria/${gameId}/claim-win`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS GENERALES
  // ========================================

  leaveGame(gameId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/game/${gameId}/leave`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  /**
   * Convierte un índice lineal (0-15) a coordenadas de matriz 4x4
   */
  indexToRowCol(index: number): { row: number; col: number } {
    return {
      row: Math.floor(index / 4),
      col: index % 4
    };
  }

  /**
   * Convierte coordenadas de matriz 4x4 a índice lineal (0-15)
   */
  rowColToIndex(row: number, col: number): number {
    return row * 4 + col;
  }

  /**
   * Valida si las coordenadas están en el rango válido (0-3)
   */
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row <= 3 && col >= 0 && col <= 3;
  }

  /**
   * Formatea el nombre de una carta para mostrar
   */
  formatCardName(cardName: string): string {
    return cardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}