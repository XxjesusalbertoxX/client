import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { AuthService } from '../../../../services/auth.service';
import { LoteriaViewModel } from '../../view-models/loteriaViewmodel';
import { GameAnfitrionComponent } from '../game-anfitrion/game-anfitrion.component';
import { GamePlayersComponent } from '../game-players/game-players.component';
import { LoteriaGameStatusResponse } from '../../models/loteria.model';

@Component({
  standalone: true,
  selector: 'app-loteria-game',
  imports: [CommonModule, GameAnfitrionComponent, GamePlayersComponent],
  templateUrl: './loteria-game.component.html',
  styleUrls: ['./loteria-game.component.scss']
})
export class LoteriaGameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteriaService = inject(LoteriaService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  viewModel = new LoteriaViewModel(this.authService);
  private intervalId?: ReturnType<typeof setInterval>;

  // Estados de modales
  private shownCheaters: Set<string> = new Set();
  showCheaterModal = false;
  showVerificationModal = false;
  showGameEndModal = false;
  showPersonalVictoryModal = false; // AGREGAR
  showPersonalCheaterModal = false; // AGREGAR

  // Datos para modales
  cheaterName = '';
  playerUnderReviewName = '';
  gameWinner = '';
  gameLoser = '';
  remainingCards: string[] = [];
  personalVictoryName = ''; // AGREGAR
  personalCheaterName = ''; // AGREGAR
  
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];

      if (!id) {
        this.router.navigate(['/games/loteria']);
        return;
      }

      this.viewModel.setGameId(id);
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
    this.pollGameStatus();

    // Polling cada 1 segundo durante el juego
    this.intervalId = setInterval(() => {
      this.pollGameStatus();
    }, 1000);
  }

  pollGameStatus() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.getGameStatus(gameId).subscribe({
      next: (status) => {
        this.viewModel.setLoading(false);
        this.handleGameStatus(status);
      },
      error: (error) => {
        console.error('Error polling game:', error);
        this.viewModel.setLoading(false);

        if (error.status === 404) {
          this.toastr.error('La partida no existe o ha terminado');
          this.router.navigate(['/games/loteria']);
        }
      }
    });
  }

  handleGameStatus(status: LoteriaGameStatusResponse) {
    console.log('=== LOTERIA GAME STATUS ===');
    console.log('Status:', status.status);
    console.log('============================');

    // Actualizar ViewModel
    this.viewModel.setGameStatus(status);

    // Manejar estados especiales
    switch (status.status) {
      case 'verification':
        this.handleVerificationState(status);
        break;

      case 'finished':
        this.handleGameFinished(status);
        break;

      case 'in_progress':
        // Verificar si hay jugadores baneados
        this.checkForBannedPlayers(status);
        break;
    }
  }

  handleVerificationState(status: LoteriaGameStatusResponse) {
    if (!this.showVerificationModal && status.playerUnderReview) {
      // Buscar el nombre del jugador bajo revisión
      const playerInfo = this.viewModel.playersInfo().find(p => p.userId === status.playerUnderReview);
      this.playerUnderReviewName = playerInfo?.user?.name || 'Jugador desconocido';
      this.showVerificationModal = true;
    }
  }

  checkForBannedPlayers(status: LoteriaGameStatusResponse) {
    // Si hay jugadores baneados que no hemos mostrado
    if (status.bannedPlayers && status.bannedPlayers.length > 0) {
      const lastBanned = status.bannedPlayers[status.bannedPlayers.length - 1];

      // CORREGIR: Solo mostrar si no lo hemos mostrado antes
      if (lastBanned && !this.showCheaterModal && !this.shownCheaters.has(lastBanned)) {
        this.cheaterName = lastBanned;
        this.showCheaterModal = true;
        this.shownCheaters.add(lastBanned); // Marcar como mostrado
      }
    }
  }

  onPlayerVictory(playerName: string) {
    this.personalVictoryName = playerName;
    this.showPersonalVictoryModal = true;
  }

  onPlayerCheater(playerName: string) {
    this.personalCheaterName = playerName;
    this.showPersonalCheaterModal = true;
  }

  onCheaterModalClose() {
      this.showCheaterModal = false;
      this.cheaterName = '';
      // No limpiar shownCheaters para evitar que se repita
  }

  onPersonalVictoryModalClose() {
    this.showPersonalVictoryModal = false;
    this.personalVictoryName = '';
  }

  onPersonalCheaterModalClose() {
    this.showPersonalCheaterModal = false;
    this.personalCheaterName = '';
    // Recargar para reflejar el estado de espectador
    window.location.reload();
  }

  handleGameFinished(status: LoteriaGameStatusResponse) {
    if (this.showGameEndModal) return;

    // Cerrar otros modales
    this.showVerificationModal = false;
    this.showCheaterModal = false;

    // Configurar datos del modal de fin
    if (status.winners && status.winners.length > 0) {
      this.gameWinner = status.winners[0];
    }

    if (status.losers && status.losers.length > 0) {
      this.gameLoser = status.losers[0];
    }

    if ('finalRemainingCards' in status && status.finalRemainingCards) {
      this.remainingCards = status.finalRemainingCards;
    } else if ('remainingCards' in status && status.remainingCards) {
      this.remainingCards = status.remainingCards;
    }

    this.showGameEndModal = true;

    // Detener polling
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  // ========================================
  // ACCIONES DE MODALES
  // ========================================
  onVerificationModalClose() {
    this.showVerificationModal = false;
    this.playerUnderReviewName = '';
  }

  onGameEndModalClose() {
    this.showGameEndModal = false;
    this.router.navigate(['/games/loteria']);
  }

  onNewGame() {
    this.router.navigate(['/games/loteria']);
  }

  onGoHome() {
    this.router.navigate(['/']);
  }

  // ========================================
  // HELPERS PARA TEMPLATES
  // ========================================

  getCardImagePath(cardName: string): string {
    const imageMap: { [key: string]: string } = {
      'el_gallo': '01 el gallo.jpg',
      'el_diablito': '02 el diablito.jpg',
      'la_dama': '03 la dama.jpg',
      'el_catrín': '04 el catrin.jpg',
      'el_paraguas': '05 el paraguas.jpg',
      'la_sirena': '06 la sirena.jpg',
      'la_escalera': '07 la escalera.jpg',
      'la_botella': '08 la botella.jpg',
      'el_barril': '09 el barril.jpg',
      'el_árbol': '10 el arbol.jpg',
      'el_melón': '11 el melon.jpg',
      'el_valiente': '12 el valiente.jpg',
      'el_gorrito': '13 el gorrito.jpg',
      'la_muerte': '14 la muerte.jpg',
      'la_pera': '15 la pera.jpg',
      'la_bandera': '16 la bandera.jpg',
      'el_bandolón': '17 el bandolon.jpg',
      'el_violoncello': '18 el violoncello.jpg',
      'la_garza': '19 la garza.jpg',
      'el_pájaro': '20 el pajaro.jpg',
      'la_mano': '21 la mano.jpg',
      'la_bota': '22 la bota.jpg',
      'la_luna': '23 la luna.jpg',
      'el_cotorro': '24 el cotorro.jpg',
      'el_borracho': '25 el borracho.jpg',
      'el_negrito': '26 el negrito.jpg',
      'el_corazón': '27 el corazon.jpg',
      'la_sandía': '28 la sandia.jpg',
      'el_tambor': '29 el tambor.jpg',
      'el_camarón': '30 el camaron.jpg',
      'las_jaras': '31 las jaras.jpg',
      'el_músico': '32 el musico.jpg',
      'la_araña': '33 la arana.jpg',
      'el_soldado': '34 el soldado.jpg',
      'la_estrella': '35 la estrella.jpg',
      'el_cazo': '36 el cazo.jpg',
      'el_mundo': '37 el mundo.jpg',
      'el_apache': '38 el apache.jpg',
      'el_nopal': '39 el nopal.jpg',
      'el_alacrán': '40 el alacran.jpg',
      'la_rosa': '41 la rosa.jpg',
      'la_calavera': '42 la calavera.jpg',
      'la_campana': '43 la campana.jpg',
      'el_cantarito': '44 el cantarito.jpg',
      'el_venado': '45 el venado.jpg',
      'el_sol': '46 el sol.jpg',
      'la_corona': '47 la corona.jpg',
      'la_chalupa': '48 la chalupa.jpg',
      'el_pino': '49 el pino.jpg',
      'el_pescado': '50 el pescado.jpg',
      'la_palma': '51 la palma.jpg',
      'la_maceta': '52 la maceta.jpg',
      'el_arpa': '53 el arpa.jpg',
      'la_rana': '54 la rana.jpg'
    };

    const fileName = imageMap[cardName] || '01 el gallo.jpg';
    return `/assets/Cartas/${fileName}`;
  }

  formatCardName(cardName: string): string {
    return cardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
