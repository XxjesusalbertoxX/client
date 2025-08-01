import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-game-end-modal',
  imports: [CommonModule],
  templateUrl: './game-end-modal.component.html',
  styleUrls: ['./game-end-modal.component.scss']
})
export class GameEndModalComponent {
  @Input() winnerName: string = '';
  @Input() loserName: string = '';
  @Input() isWinner: boolean = false;
  @Input() gameType: 'simon' | 'battleship' = 'simon'; // Nuevo: tipo de juego

  @Output() createNewGame = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();
}