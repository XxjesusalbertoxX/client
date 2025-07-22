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
  @Input() disabled: boolean = false;      // deshabilitar interacción

  @Output() attack = new EventEmitter<{ x: number, y: number }>();

  handleCellClick(x: number, y: number) {
    // No permitir ataques en tablero propio o si está deshabilitado
    if (this.isOwnBoard || this.disabled) return;

    // No permitir ataques en celdas ya atacadas (2=agua, 3=barco hundido)
    const cellValue = this.board[y][x];
    if (cellValue === 2 || cellValue === 3) return;

    this.attack.emit({ x, y });
  }

  getCellClass(value: number): string {
    const baseClass = this.disabled && !this.isOwnBoard ? 'disabled ' : '';

    switch (value) {
      case 1: return baseClass + (this.isOwnBoard ? 'ship' : 'empty'); // ocultar barcos enemigos
      case 2: return baseClass + 'miss';
      case 3: return baseClass + 'hit';
      default: return baseClass + 'empty'; // case 0
    }
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }
}
