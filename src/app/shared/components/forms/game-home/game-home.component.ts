import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameConfig {
  title: string;
  emoji: string;
  description: string;
  backgroundGradient: string;
  floatingEmojis: string[];
}

@Component({
  standalone: true,
  selector: 'app-game-home',
  imports: [CommonModule],
  templateUrl: './game-home.component.html',
  styleUrls: ['./game-home.component.scss']
})
export class GameHomeComponent {
  @Input() gameType: 'battleship' | 'simon' = 'battleship';
  @Output() createGame = new EventEmitter<void>();
  @Output() joinGame = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  get config(): GameConfig {
    const configs: Record<string, GameConfig> = {
      battleship: {
        title: 'Batalla Naval',
        emoji: '⚓',
        description: 'Prepárate para la batalla definitiva en alta mar. Estrategia, precisión y un poco de suerte decidirán el destino de tu flota.',
        backgroundGradient: 'from-slate-900 via-blue-900 to-indigo-900',
        floatingEmojis: ['🚢', '⛵', '🛥️']
      },
      simon: {
        title: 'Simon Dice',
        emoji: '🎨',
        description: 'Pon a prueba tu memoria y concentración. Repite las secuencias de colores cada vez más complejas y conviértete en el maestro de Simon.',
        backgroundGradient: 'from-slate-900 via-purple-900 to-indigo-900',
        floatingEmojis: ['🎯', '🌈', '✨']
      }
    };
    return configs[this.gameType];
  }

  onCreateClick() {
    this.createGame.emit();
  }

  onJoinClick() {
    this.joinGame.emit();
  }

  onBackClick() {
    this.goBack.emit();
  }
}