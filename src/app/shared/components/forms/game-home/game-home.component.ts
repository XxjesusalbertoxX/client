import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameConfig {
  title: string;
  emoji: string;
  description: string;
  backgroundGradient: string;
  floatingEmojis: string[];
  createButtonText: string;
  createButtonDesc: string;
  joinButtonText: string;
  joinButtonDesc: string;
  createIcon: string;
  joinIcon: string;
  competitiveText: string;
}

@Component({
  standalone: true,
  selector: 'app-game-home',
  imports: [CommonModule],
  templateUrl: './game-home.component.html',
  styleUrls: ['./game-home.component.scss']
})
export class GameHomeComponent {
  @Input() gameType: 'battleship' | 'simon' | 'loteria' = 'battleship';
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
        floatingEmojis: ['🚢', '⛵', '🛥️'],
        createButtonText: 'Crear Partida',
        createButtonDesc: 'Sé el capitán de tu propia batalla. Invita a un amigo y demuestra quién domina los mares.',
        joinButtonText: 'Unirse a Partida',
        joinButtonDesc: '¿Tienes un código de batalla? Únete a la guerra naval y demuestra tu valía como marinero.',
        createIcon: '🎯',
        joinIcon: '🧭',
        competitiveText: 'Sube de nivel y domina los océanos'
      },
      simon: {
        title: 'Simon Dice',
        emoji: '🎨',
        description: 'Pon a prueba tu memoria y concentración. Repite las secuencias de colores cada vez más complejas y conviértete en el maestro de Simon.',
        backgroundGradient: 'from-slate-900 via-purple-900 to-indigo-900',
        floatingEmojis: ['🎯', '🌈', '✨'],
        createButtonText: 'Crear Partida',
        createButtonDesc: 'Inicia una nueva partida de Simon Dice. Desafía a tu memoria y la de tus amigos.',
        joinButtonText: 'Unirse a Partida',
        joinButtonDesc: '¿Tienes un código de partida? Únete al desafío de memoria y pon a prueba tu concentración.',
        createIcon: '🎯',
        joinIcon: '🎮',
        competitiveText: 'Mejora tu memoria y concentración'
      },
      loteria: {
        title: 'Lotería Mexicana',
        emoji: '🎲',
        description: '¡La auténtica lotería mexicana! Escucha al gritón, marca tu tabla y grita: "¡LOTERÍA!" cuando completes tu carta.',
        backgroundGradient: 'from-red-900 via-orange-900 to-yellow-900',
        floatingEmojis: ['🌮', '🌵', '🎺'],
        createButtonText: 'Ser el Gritón',
        createButtonDesc: 'Crea una partida y controla el juego. Tú decides el ritmo y sacas las cartas del mazo.',
        joinButtonText: 'Unirse a la Feria',
        joinButtonDesc: '¿Tienes un código de partida? Únete a la diversión y demuestra tu suerte con las cartas.',
        createIcon: '🎯',
        joinIcon: '🎫',
        competitiveText: 'Velocidad, suerte y concentración'
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