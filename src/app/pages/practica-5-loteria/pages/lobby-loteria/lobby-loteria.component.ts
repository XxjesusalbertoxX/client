import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { AuthService } from '../../../../services/auth.service';
import { LoteriaViewModel } from '../../view-models/loteriaViewmodel';
import { LobbyPlayerCardComponent } from '../../components/lobby-player-card/lobby-player-card.component';
import { LoteriaCardComponent } from '../../components/loteria-card/loteria-card.component';

@Component({
  standalone: true,
  selector: 'app-lobby-loteria',
  imports: [CommonModule, LobbyPlayerCardComponent, LoteriaCardComponent],
  templateUrl: './lobby-loteria.component.html',
  styleUrls: ['./lobby-loteria.component.scss']
})
export class LobbyLoteriaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteriaService = inject(LoteriaService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  viewModel = new LoteriaViewModel(this.authService);
  
  private intervalId?: ReturnType<typeof setInterval>;
  isGeneratingCard = false;
  showMyCard = false;
  myGeneratedCard: string[] = [];
  hasGeneratedCard = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const code = params['code'];

      if (!id) {
        this.router.navigate(['/games/loteria']);
        return;
      }

      this.viewModel.setGameId(id);
      if (code) {
        this.viewModel.setGameCode(code);
      }

      this.startPolling();
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startPolling() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    // Poll inmediato
    this.pollLobbyStatus();

    // Polling cada 2 segundos
    this.intervalId = setInterval(() => {
      this.pollLobbyStatus();
    }, 2000);
  }

  pollLobbyStatus() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.getLobbyStatus(gameId).subscribe({
      next: (status) => {
        this.viewModel.setLoading(false);
        this.viewModel.setLobbyStatus(status);

        // Si el juego ya empezó, navegar al juego
        if (status.status === 'in_progress') {
          this.router.navigate(['/games/loteria/game'], {
            queryParams: { id: gameId }
          });
        }
      },
      error: (error) => {
        console.error('Error polling lobby:', error);
        this.viewModel.setLoading(false);
        
        if (error.status === 404) {
          this.toastr.error('La partida no existe o ha terminado');
          this.router.navigate(['/games/loteria']);
        }
      }
    });
  }

  onGenerateCard() {
    const gameId = this.viewModel.gameId();
    if (!gameId || this.isGeneratingCard) return;

    this.isGeneratingCard = true;

    this.loteriaService.generateCard(gameId).subscribe({
      next: (response) => {
        this.myGeneratedCard = response.playerCard;
        this.hasGeneratedCard = true;
        this.showMyCard = true; // Mostrar automáticamente la nueva carta
        this.toastr.success('¡Nueva carta generada!');
        this.isGeneratingCard = false;
        
        // Actualizar el estado inmediatamente
        this.pollLobbyStatus();
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al generar carta');
        this.isGeneratingCard = false;
      }
    });
  }

  onSetReady() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.setReady(gameId).subscribe({
      next: (response) => {
        this.toastr.success('¡Marcado como listo!');
        // Actualizar el estado inmediatamente
        this.pollLobbyStatus();
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al marcar como listo');
      }
    });
  }

  onStartGame() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.startGame(gameId).subscribe({
      next: (response) => {
        this.toastr.success('¡Iniciando lotería!');
        this.router.navigate(['/games/loteria/game'], {
          queryParams: { id: gameId }
        });
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al iniciar partida');
      }
    });
  }

  onKickPlayer(userId: number) {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    const player = this.viewModel.players().find(p => p.userId === userId);
    const playerName = player?.user?.name || 'Jugador';

    if (confirm(`¿Estás seguro de expulsar a ${playerName}?`)) {
      this.loteriaService.kickPlayer(gameId, { kickUserId: userId }).subscribe({
        next: (response) => {
          this.toastr.info(response.message);
          // Actualizar el estado inmediatamente
          this.pollLobbyStatus();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al expulsar jugador');
        }
      });
    }
  }

  onLeaveGame() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    // TODO: Implementar leave game cuando esté disponible en el backend
    this.router.navigate(['/games/loteria']);
  }

  onCopyCode() {
    const code = this.viewModel.gameCode();
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Código copiado al portapapeles');
    });
  }

  toggleMyCard() {
    this.showMyCard = !this.showMyCard;
  }

  // Getters para el template
  get currentUserId(): number {
    return this.viewModel.getUserId();
  }

  get isHost(): boolean {
    return this.viewModel.isHost();
  }

  get canShowCode(): boolean {
    return this.isHost && this.viewModel.currentPlayers() < this.viewModel.maxPlayers();
  }

  get canStartGame(): boolean {
    return this.viewModel.gameCanStart();
  }

  get progressPercentage(): number {
    const current = this.viewModel.currentPlayers();
    const min = this.viewModel.minPlayers();
    return Math.min((current / min) * 100, 100);
  }

  getPlayerGridClass(): string {
    const playerCount = this.viewModel.currentPlayers();
    
    if (playerCount <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    if (playerCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (playerCount <= 9) return 'grid-cols-1 md:grid-cols-3';
    if (playerCount <= 12) return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
  }
}