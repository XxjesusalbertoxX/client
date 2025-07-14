import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from '../../components/board/board.component';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-game',
  imports: [CommonModule, BoardComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  myBoard = signal<number[][]>([]);
  enemyBoard = signal<number[][]>([]);
  gameId = signal<number | null>(null);
  currentTurnId = signal<number | null>(null);
  myUserId = signal<number | null>(null);

  intervalId?: ReturnType<typeof setInterval>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const id = this.extractGameId();

    this.gameId.set(id);
    this.startPolling();
  }

  extractGameId(): number {
    return Number(localStorage.getItem('currentGameId'));
  }

  startPolling() {
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.http.get<any>(`/game/${id}/status`).subscribe({
        next: (status) => {
          this.myBoard.set(status.my_board);
          this.enemyBoard.set(status.enemy_board);
          this.currentTurnId.set(status.current_turn_user_id);
          this.myUserId.set(
            status.players.find((p: any) => p.is_self)?.id || null
          );
        }
      });
    }, 2000);
  }

  onAttack(event: { x: number; y: number }) {
    if (this.currentTurnId() !== this.myUserId()) {
      console.warn('No es tu turno');
      return;
    }

    const id = this.gameId();
    this.http.post(`/game/${event.x}/${event.y}/attack`, {}).subscribe({
      next: (res) => console.log('Ataque enviado'),
      error: (err) => console.error('Error al atacar', err)
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
