import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @Input() board: number[][] = [];
  @Input() isOwnBoard: boolean = false;    // true = defensa, false = ataque

  @Output() attack = new EventEmitter<{ x: number, y: number }>();

  handleCellClick(x: number, y: number) {
    if (this.isOwnBoard) return; // No puedes atacar tu propio tablero
    this.attack.emit({ x, y });
  }

  getCellClass(value: number): string {
    switch (value) {
      case 1: return this.isOwnBoard ? 'ship' : 'empty'; // ocultar barcos enemigos
      case 2: return 'miss';
      case 3: return 'hit';
      default: return 'empty'; // case 0
    }
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }


}
