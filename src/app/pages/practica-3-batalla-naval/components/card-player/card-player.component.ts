import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyPlayer } from '../../models/battle-ship.model';

@Component({
  standalone: true,
  selector: 'app-card-player',
  imports: [CommonModule],
  templateUrl: './card-player.component.html',
  styleUrls: ['./card-player.component.scss'],
})
export class CardPlayerComponent {
  @Input() player!: LobbyPlayer | null;
  @Input() isCurrent: boolean = false;
  @Input() canReady: boolean = false;

  @Output() ready = new EventEmitter<void>();

  handleReady() {
    this.ready.emit();
  }
}
