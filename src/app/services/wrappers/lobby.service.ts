import { Injectable, inject } from '@angular/core';
import { GameApiService } from '../gameservices/game-api.service';
import { SimonSayService } from '../gameservices/simonsay.services';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  private gameApi = inject(GameApiService);
  private simonsay = inject(SimonSayService);

  getLobbyStatus(type: string, id: string) {
    if (type === 'battleship') return this.gameApi.getLobbyStatus(id);
    if (type === 'simonsay') return this.simonsay.getLobbyStatus(id);
    throw new Error('Tipo de juego no soportado');
  }

  startGame(type: string, id: string) {
    if (type === 'battleship') return this.gameApi.startGame(id);
    if (type === 'simonsay') return this.simonsay.startGame(id);
    throw new Error('Tipo de juego no soportado');
  }

  setReady(type: string, id: string) {
    if (type === 'battleship') return this.gameApi.setReady(id);
    if (type === 'simonsay') return this.simonsay.setReady(id);
    throw new Error('Tipo de juego no soportado');
  }

  heartbeat(type: string, id: string) {
    if (type === 'battleship') return this.gameApi.heartbeat(id);
    if (type === 'simonsay') return this.simonsay.heartbeat(id);
    throw new Error('Tipo de juego no soportado');
  }
}
