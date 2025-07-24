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
  @Input() isOwnBoard: boolean = false;
  @Input() disabled: boolean = false;
  @Input() playerName: string = '';
  @Input() shipsRemaining: number = 0;

  @Output() attack = new EventEmitter<{ x: number, y: number }>();

  handleCellClick(row: number, col: number) {
    // No permitir ataques en tablero propio o si está deshabilitado
    if (this.isOwnBoard || this.disabled) return;

    // No permitir ataques en celdas ya atacadas (2=agua, 3=barco hundido)
    const cellValue = this.board[row][col];
    if (cellValue === 2 || cellValue === 3) return;

    // Emitir coordenadas correctas: x=columna, y=fila
    this.attack.emit({ x: col, y: row }); // x = columna, y = fila
  }

    getCellClasses(value: number): string {
    const baseClasses = 'rounded-sm';
    
    // Siempre mostrar los colores, solo cambiar el cursor
    switch (value) {
      case 1: 
        return `${baseClasses} bg-blue-500 ${this.disabled && !this.isOwnBoard ? 'cursor-not-allowed' : (!this.isOwnBoard ? 'hover:bg-blue-600 cursor-pointer' : '')}`;
      case 2: 
        return `${baseClasses} bg-gray-300 cursor-not-allowed`;
      case 3: 
        return `${baseClasses} bg-red-500 cursor-not-allowed`;
      default: 
        return `${baseClasses} bg-gray-100 ${this.disabled && !this.isOwnBoard ? 'cursor-not-allowed' : (!this.isOwnBoard ? 'hover:bg-blue-100 cursor-pointer' : '')}`;
    }
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }

    getShipsCount(): number {
    if (!this.board || this.board.length === 0) return 0;
    let shipCells = 0;
    for (let row of this.board) {
      for (let cell of row) {
        if (cell === 1 || cell === 3) { // 1=barco intacto, 3=barco tocado
          shipCells++;
        }
      }
    }
    return shipCells; // Cada barco es una celda
  }

  get columnIndexes(): number[] {
    return this.board && this.board[0] ? Array.from({ length: this.board[0].length }, (_, i) => i) : [];
  }
  
  get rowIndexes(): number[] {
    return this.board ? Array.from({ length: this.board.length }, (_, i) => i) : [];
  }
}