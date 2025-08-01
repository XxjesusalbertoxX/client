import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardPlayerComponent } from '../../card-player/card-player.component';
import { LobbyPlayer } from '../../../../models/game.model';
import { ColorPickerModalComponent } from '../../../../pages/practica-4-simon-say/components/color-picker-modal/color-picker-modal.component';

interface LobbyConfig {
  title: string;
  emoji: string;
  backgroundGradient: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-game-lobby',
  imports: [CommonModule, CardPlayerComponent, ColorPickerModalComponent],
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
  @Input() isHost = false; // NUEVO: para saber si soy el host
  @Input() isMeReady = false; // NUEVO: para saber si ya estoy listo
  
  // Simon Say específico
  @Input() showColorPicker = false;
  @Input() myColors: string[] = [];
  
  @Output() copyCode = new EventEmitter<void>();
  @Output() handleReady = new EventEmitter<void>();
  @Output() openColorPicker = new EventEmitter<void>();
  @Output() colorsSelected = new EventEmitter<string[]>();
  @Output() leaveGame = new EventEmitter<void>(); // NUEVO: para salir del lobby

  ngOnInit() {
    // Inicialización si es necesaria
  }

  get config(): LobbyConfig {
    const configs: Record<string, LobbyConfig> = {
      battleship: {
        title: 'Batalla Naval',
        emoji: '⚓',
        backgroundGradient: 'from-slate-900 via-blue-900 to-indigo-900',
        description: 'Prepara tu flota para la batalla'
      },
      simon: {
        title: 'Simon Dice',
        emoji: '🎨',
        backgroundGradient: 'from-slate-900 via-purple-900 to-indigo-900',
        description: 'Configura tu paleta de colores'
      },
      loteria: {
        title: 'Lotería Mexicana',
        emoji: '🎲',
        backgroundGradient: 'from-slate-900 via-orange-900 to-red-900',
        description: 'Esperando más jugadores (5-16)'
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

  onOpenColorPicker() {
    this.openColorPicker.emit();
  }

  onColorsSelected(colors: string[]) {
    this.colorsSelected.emit(colors);
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