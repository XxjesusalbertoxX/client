import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoteriaLobbyPlayer } from '../../models/loteria.model';

@Component({
  standalone: true,
  selector: 'app-lobby-player-card',
  imports: [CommonModule],
  templateUrl: './lobby-player-card.component.html',
  styleUrls: ['./lobby-player-card.component.scss']
})
export class LobbyPlayerCardComponent {
  @Input() player!: LoteriaLobbyPlayer;
  @Input() isMe: boolean = false;
  @Input() canStartGame: boolean = false;
  @Input() showKickButton: boolean = false;

  @Output() startGame = new EventEmitter<void>();
  @Output() kickPlayer = new EventEmitter<number>();

  getPlayerInitials(): string {
    const name = this.player.user?.name || 'J';
    return name.charAt(0).toUpperCase();
  }

  onStartGame() {
    this.startGame.emit();
  }

  onKick() {
    this.kickPlayer.emit(this.player.userId);
  }
}