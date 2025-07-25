import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SimonSayService } from '../../services/gameservices/simonsay.services';
import { CardPlayerComponent } from '../../shared/components/card-player/card-player.component';
import { LobbyPlayer, LobbyStatusResponse } from '../../models/game.model';
import { AuthService } from '../../services/auth.service';
import { ColorPickerModalComponent } from '../practica-4-simon-say/components/color-picker-modal/color-picker-modal.component';

@Component({
  standalone: true,
  selector: 'app-lobby-simonsay',
  imports: [CommonModule, CardPlayerComponent, RouterModule, ColorPickerModalComponent],
  templateUrl: './lobby-simonsay.component.html',
  styleUrls: ['./lobby-simonsay.component.scss'],
})
export class LobbySimonsayComponent implements OnInit, OnDestroy {
  gameId = signal<string | null>(null);
  gameCode = signal<string | null>(null);
  players = signal<LobbyPlayer[]>([]);
  isHost = false;
  isLoading = true;
  intervalId?: ReturnType<typeof setInterval>;
  heartbeatInterval?: ReturnType<typeof setInterval>;
  
  // SimonSay específico
  showColorPicker = false;
  myColors: string[] = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simonSayService: SimonSayService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) return;
      this.gameId.set(id);
      this.gameCode.set(code ?? id);

      this.isHost = !!code;

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

  get canSetReady(): boolean {
    const myUserId = Number(this.authService.getUserId());
    const me = this.players().find(p => p.userId === myUserId);
    return this.twoPlayers && me?.customColors?.length === 6;
  }

  copyGameCode() {
    const code = this.gameCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
  }

  openColorPicker() {
    this.showColorPicker = true;
  }

  onColorsSelected(colors: string[]) {
    const gameId = this.gameId();
    if (!gameId) return;

    this.simonSayService.setColors(gameId, colors).subscribe({
      next: () => {
        this.myColors = colors;
        this.showColorPicker = false;
      },
      error: (err) => {
        console.error('Error setting colors:', err);
      }
    });
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    const id = this.gameId();
    if (!id) return;

    this.intervalId = setInterval(() => {
      this.simonSayService.getLobbyStatus(id).subscribe({
        next: (status: LobbyStatusResponse) => {
          this.isLoading = false;

          if ((status as any).status === 'in_progress' || (status as any).status === 'waiting_first_color') {
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
        error: (err) => console.error('Error en heartbeat:', err),
      });
    }, 5000);
  }

  handleReady() {
    const id = this.gameId();
    if (!id || !this.canSetReady) return;

    this.simonSayService.setReady(id).subscribe({
      next: () => console.log('Jugador listo'),
      error: (err: any) => console.error('Error al marcar ready', err),
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}