import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { GameApiService } from '../../../../services/gameservices/game-api.service';
import { LobbyPlayer, LobbyStatusResponse } from '../../../../models/game.model';
import { AuthService } from '../../../../services/auth.service';
import { GameLobbyComponent } from '../../../../shared/components/forms/game-lobby/game-lobby.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-lobby',
  imports: [CommonModule, GameLobbyComponent, RouterModule],
  template: `
    <app-game-lobby
      gameType="battleship"
      [gameCode]="gameCode()"
      [players]="players()"
      [isLoading]="isLoading"
      [allReady]="allReady"
      [twoPlayers]="twoPlayers"
      [canSetReady]="true"
      [isHost]="isHost"
      [isMeReady]="isMeReady"
      (copyCode)="copyGameCode()"
      (handleReady)="handleReady()"
      (leaveGame)="onLeaveGame()">
    </app-game-lobby>
  `
})
export class LobbyComponent implements OnInit, OnDestroy {
  gameId = signal<string | null>(null);
  gameCode = signal<string | null>(null);
  players = signal<LobbyPlayer[]>([]);
  isHost = false;
  isLoading = true;
  intervalId?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameApiService: GameApiService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) return;
      this.gameId.set(id);
      this.gameCode.set(code || null); // Solo asignar código si existe

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

  get isMeReady(): boolean {
    const myUserId = Number(this.authService.getUserId());
    const me = this.players().find(p => p.userId === myUserId);
    return !!me?.ready;
  }

  copyGameCode() {
    const code = this.gameCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
  }

    // En ambos lobby components, cambiar:
  
  onLeaveGame() {
    const id = this.gameId();
    if (!id) return;
  
    this.isLoading = true;
    
    // CAMBIO: Usar gameApiService.leaveGame() sin playerGameId
    this.gameApiService.leaveGame(id).subscribe({
      next: (result) => {
        this.toastr.info(result.message || 'Has salido del lobby');
        this.router.navigate(['/games/battleship']); // o simonsay
      },
      error: (err) => {
        console.error('Error leaving game:', err);
        this.router.navigate(['/games/battleship']); // o simonsay
      },
    });
  }
  
  // ELIMINAR: getMyPlayerGameId() ya no se necesita

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.gameApiService.getLobbyStatus(id).subscribe({
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
              this.gameApiService.startGame(id).subscribe({
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
      this.gameApiService.heartbeat(id).subscribe({
        next: (res) => console.log('Heartbeat:', res.message),
        error: (err) => console.error('Error en heartbeat:', err),
      });
    }, 5000);
  }

  handleReady() {
    const id = this.gameId();
    if (!id) return;

    this.gameApiService.setReady(id).subscribe({
      next: () => console.log('Jugador listo'),
      error: (err: any) => console.error('Error al marcar ready', err),
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}
