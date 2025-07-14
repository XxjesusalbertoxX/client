// src/app/pages/practica-3-battalla-naval/pages/lobby/lobby.component.ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BattleShipService } from '../../../../services/battle-ship.service';
import { CardPlayerComponent } from '../../components/card-player/card-player.component';
import { LobbyPlayer, LobbyStatusResponse } from '../../models/battle-ship.model';

@Component({
  standalone: true,
  selector: 'app-lobby',
  imports: [CommonModule, CardPlayerComponent, RouterModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  gameId = signal<string | null>(null);
  gameCode = signal<string | null>(null);
  players = signal<LobbyPlayer[]>([]);
  intervalId?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: BattleShipService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) return;
      this.gameId.set(id);
      this.gameCode.set(code ?? id); // Si no viene el código, usar el id como fallback

      this.startPolling();
      this.startHeartbeat();

    });
  }

  copyGameCode() {
    const code = this.gameCode();
    if (!code) return;
    navigator.clipboard.writeText(code).then(
      () => alert('Código copiado al portapapeles'),
      () => alert('No se pudo copiar el código')
    );
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.gameService.getLobbyStatus(id).subscribe({
        next: (status: LobbyStatusResponse) => {
          if (status.started) {
          const id = this.gameId();
          if (!id) return;

          this.gameService.startGame(id).subscribe({
            next: (res) => {
              console.log('Juego iniciado:', res);
              this.router.navigate(['games/battleship/game'], { queryParams: { id } });
            },
            error: (err) => {
              console.error('Error al iniciar el juego:', err);
              this.router.navigate(['games/battleship/game'], { queryParams: { id } });
            },
          });

          return;
        }

          this.players.set(status.players);
        },
        error: (err) => {
          console.error('Error en polling lobby:', err);
        },
      });
    }, 2000);
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    const id = this.gameId();
    if (!id) return;

    this.heartbeatInterval = setInterval(() => {
      this.gameService.heartbeat(id).subscribe({
        next: (res) => console.log('Heartbeat:', res.message),
        error: (err) => console.error('Error en heartbeat:', err),
      });
    }, 5000); // cada 5 segundos
  }


  handleReady() {
    const id = this.gameId();
    if (!id) return;

    this.gameService.markReady(id).subscribe({
      next: () => console.log('Jugador listo'),
      error: (err: any) => console.error('Error al marcar ready', err),
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}
