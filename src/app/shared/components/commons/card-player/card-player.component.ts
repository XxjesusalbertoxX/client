import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyPlayer } from '../../../models/game.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-card-player',
  imports: [CommonModule],
  templateUrl: './card-player.component.html',
  styleUrls: ['./card-player.component.scss'],
})
export class CardPlayerComponent {
  @Input() player!: LobbyPlayer | null;
  @Input() canReady: boolean = false;
  @Input() gameType: string = 'battleship'; // ← Agregar esta línea
  @Output() ready = new EventEmitter<void>();

  private authService = inject(AuthService);

  get isCurrent(): boolean {
    if (!this.player) return false;
    return Number(this.authService.getUserId()) === this.player.userId;
  }

  handleReady() {
    if (this.isCurrent && !this.player?.ready) {
      this.ready.emit();
    }
  }
}