import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { GameApiService } from '../../../../services/gameservices/game-api.service';
import { LobbyPlayer, LobbyStatusResponse } from '../../../../models/game.model';
import { AuthService } from '../../../../services/auth.service';
import { GameLobbyComponent } from '../../../../shared/components/forms/game-lobby/game-lobby.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-lobby-simonsay',
  imports: [CommonModule, GameLobbyComponent, RouterModule],
  templateUrl: './lobby-simonsay.component.html'
})
export class LobbySimonsayComponent implements OnInit, OnDestroy {
  gameId = signal<string | null>(null);
  gameCode = signal<string | null>(null);
  players = signal<LobbyPlayer[]>([]);
  isHost = false;
  isLoading = true;
  intervalId?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;
  availableColors = signal<string[]>([]);  // NUEVO: colores de la partida

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simonSayService: SimonSayService,
    private authService: AuthService,
    private gameApiService: GameApiService,
    private toastr: ToastrService
  ) {}

  get canSetReady(): boolean {
    const myUserId = Number(this.authService.getUserId());
    const me = this.players().find(p => p.userId === myUserId);
    return this.twoPlayers; // Simplificado - solo necesita 2 jugadores
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) {
        this.router.navigate(['/games/simonsay']);
        return;
      }

      this.gameId.set(id);
      this.gameCode.set(code || null);
      this.isHost = !!code;

      this.startPolling();
      this.startHeartbeat();
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
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

    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Código copiado al portapapeles');
    });
  }

  onLeaveGame() {
    const id = this.gameId();
    if (!id) return;

    this.isLoading = true;

    this.gameApiService.leaveGame(id).subscribe({
      next: (result) => {
        this.toastr.info(result.message || 'Has salido del lobby');
        this.router.navigate(['/games/simonsay']);
      },
      error: (err) => {
        console.error('Error leaving game:', err);
        this.toastr.error('Error al salir del lobby');
        this.router.navigate(['/games/simonsay']);
      },
    });
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.simonSayService.getLobbyStatus(id).subscribe({
        next: (status: any) => { // Cambiado el tipo para incluir availableColors
          this.isLoading = false;

          // Si el juego está en progreso, ir al juego
          if (status.status === 'in_progress' || status.status === 'started') {
            this.router.navigate(['games/simonsay/game'], { queryParams: { id } });
            return;
          }

          if (status.started) {
            if (this.isHostPlayer(status.players)) {
              this.simonSayService.startGame(id).subscribe({
                next: () => {
                  this.router.navigate(['games/simonsay/game'], { queryParams: { id } });
                },
                error: () => {
                  this.router.navigate(['games/simonsay/game'], { queryParams: { id } });
                },
              });
            } else {
              this.router.navigate(['games/simonsay/game'], { queryParams: { id } });
            }
            return;
          }

          this.players.set(status.players);

          // NUEVO: Actualizar los colores disponibles de la partida
          if (status.availableColors) {
            this.availableColors.set(status.availableColors);
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }, 2000);
  }



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
      this.simonSayService.heartbeat(id).subscribe({
        next: (res) => console.log('Heartbeat:', res.message),
        error: (err) => console.warn('Error en heartbeat:', err),
      });
    }, 5000);
  }

  handleReady() {
    const id = this.gameId();
    if (!id || !this.canSetReady) return;

    this.simonSayService.setReady(id).subscribe({
      next: () => {
        console.log('Jugador listo');
        this.toastr.success('¡Estás listo para jugar!');
      },
      error: (err: any) => {
        console.error('Error al marcar ready', err);
        this.toastr.error('Error al marcar como listo');
      },
    });
  }
}
