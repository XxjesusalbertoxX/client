import { Component, Input, Output, EventEmitter, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardPlayerComponent } from '../../card-player/card-player.component';
import { LobbyPlayer } from '../../../../models/game.model';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

interface LobbyConfig {
  title: string;
  emoji: string;
  backgroundGradient: string;
  description: string;
  instructions: string;
}

@Component({
  standalone: true,
  selector: 'app-game-lobby',
  imports: [CommonModule, CardPlayerComponent],
  templateUrl: './game-lobby.component.html',
  styleUrls: ['./game-lobby.component.scss']
})
export class GameLobbyComponent implements OnInit {
  @Input() gameType: 'battleship' | 'simon' | 'loteria' = 'battleship';
  @Input() gameCode: string | null = null;
  @Input() players: LobbyPlayer[] = [];
  @Input() isLoading = false;
  @Input() allReady = false;
  @Input() twoPlayers = false;
  @Input() canSetReady = false;
  @Input() isHost = false;
  @Input() isMeReady = false;

  // Simon Say específico - ACTUALIZAR
  @Input() availableColors: string[] = []; // CAMBIAR: de myColors a availableColors

  @Output() copyCode = new EventEmitter<void>();
  @Output() handleReady = new EventEmitter<void>();
  @Output() leaveGame = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  get config(): LobbyConfig {
    const configs = {
      battleship: {
        title: 'Batalla Naval',
        emoji: '🚢',
        backgroundGradient: 'from-blue-900 via-slate-900 to-gray-900',
        description: 'Preparándose para el combate naval',
        instructions: 'Coloca tus barcos estratégicamente y hunde la flota enemiga. Usa coordenadas para atacar.'
      },
      simon: {
        title: 'Simon Dice',
        emoji: '🎨',
        backgroundGradient: 'from-purple-900 via-pink-900 to-indigo-900',
        description: 'Preparándose para el desafío de memoria',
        instructions: 'Repite las secuencias de colores que tu oponente agregue. Cada turno se agrega un nuevo color. <strong>¡El que falle primero pierde!</strong>'
      },
      loteria: {
        title: 'Lotería Mexicana',
        emoji: '�',
        backgroundGradient: 'from-yellow-900 via-orange-900 to-red-900',
        description: 'Preparándose para la lotería tradicional',
        instructions: 'Marca las cartas que se van cantando en tu tablero. ¡El primero en completar una línea gana!'
      }
    };

    return configs[this.gameType];
  }

  get minPlayersReached(): boolean {
    if (this.gameType === 'loteria') {
      return this.players.length >= 5;
    }
    return this.players.length >= 2;
  }

  get maxPlayersReached(): boolean {
    if (this.gameType === 'loteria') {
      return this.players.length >= 16;
    }
    return this.players.length >= 2;
  }

  get playersStatusText(): string {
    if (this.gameType === 'loteria') {
      return `${this.players.length}/16 jugadores`;
    }
    return `${this.players.length}/2 jugadores`;
  }

  getEmptySlots(): any[] {
    const maxSlots = this.gameType === 'loteria' ? 16 : 2;
    const emptyCount = Math.max(0, maxSlots - this.players.length);
    return new Array(emptyCount);
  }

  onCopyCode() {
    this.copyCode.emit();
  }

  onReady() {
    this.handleReady.emit();
  }

  onLeaveGame() {
    this.leaveGame.emit();
  }

  // Funciones para optimizar el renderizado
  trackByPlayerId(index: number, player: LobbyPlayer): any {
    return player.userId;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByColor(index: number, color: string): string {
    return color;
  }
}
