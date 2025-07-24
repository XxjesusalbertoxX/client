// src/app/pages/practica-3-battalla-naval/pages/lobby/lobby.component.ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BattleShipService } from '../../../../services/battle-ship.service';
import { CardPlayerComponent } from '../../components/card-player/card-player.component';
import { LobbyPlayer, LobbyStatusResponse } from '../../models/battle-ship.model';
import { AuthService } from '../../../../services/auth.service';


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
  isHost = false; // propiedad: ¿soy el host según el query param?
  isLoading = true;
  intervalId?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: BattleShipService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) return;
      this.gameId.set(id);
      this.gameCode.set(code ?? id);

      this.isHost = !!code; // true si viene el código (host), false si solo id (invitado)

      this.startPolling();
      this.startHeartbeat();
    });
  }

  get allReady(): boolean {
    const players = this.players();
    return players.length === 2 && players.every(p => p.ready);
  }

  get twoPlayers(): boolean {
    return this.players().length === 2;
  }

  copyGameCode() {
    const code = this.gameCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.gameService.getLobbyStatus(id).subscribe({
        next: (status: LobbyStatusResponse) => {
          this.isLoading = false;

          // Si el juego está en progreso, navega todos
          if (status.status === 'in_progress') {
            this.router.navigate(['games/battleship/game'], { queryParams: { id } });
            return;
          }

          if (status.started) {
            // Solo el host inicia la partida
            if (this.isHostPlayer(status.players)) {
              this.gameService.startGame(id).subscribe({
                next: () => {
                  this.router.navigate(['games/battleship/game'], { queryParams: { id } });
                },
                error: () => {
                  this.router.navigate(['games/battleship/game'], { queryParams: { id } });
                },
              });
            } else {
              // Los demás solo navegan cuando el juego ya está iniciado
              this.router.navigate(['games/battleship/game'], { queryParams: { id } });
            }
            return;
          }
          this.players.set(status.players);
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }, 2000);
  }

  // Renombrado para evitar conflicto
  isHostPlayer(players: LobbyPlayer[]): boolean {
    const myUserId = Number(this.authService.getUserId());
    const hostId = Number(players.length > 0 ? players[0].userId : null);
    return hostId === myUserId;
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
    }, 5000);
  }

  handleReady() {
    const id = this.gameId();
    if (!id) return;

    this.gameService.setReady(id).subscribe({
      next: () => console.log('Jugador listo'),
      error: (err: any) => console.error('Error al marcar ready', err),
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}