import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-game-end-modal',
  templateUrl: './game-end-modal.component.html',
  styleUrls: ['./game-end-modal.component.scss']
})
export class GameEndModalComponent {
  @Input() winnerName: string = '';
  @Input() loserName: string = '';
  @Input() isWinner: boolean = false;
  @Input() rematchRequested: boolean = false;
  @Input() opponentLeft: boolean = false;

  @Output() leave = new EventEmitter<void>();
  @Output() rematch = new EventEmitter<void>();
  @Output() newGame = new EventEmitter<void>();
}