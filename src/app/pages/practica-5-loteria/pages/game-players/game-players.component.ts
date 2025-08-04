import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { LoteriaViewModel } from '../../view-models/loteriaViewmodel';
import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { LoteriaCardComponent } from '../../components/loteria-card/loteria-card.component';

@Component({
  standalone: true,
  selector: 'app-game-players',
  imports: [CommonModule, LoteriaCardComponent],
  templateUrl: './game-players.component.html',
  styleUrls: ['./game-players.component.scss']
})
export class GamePlayersComponent implements OnInit {
  @Input() viewModel!: LoteriaViewModel;

  private loteriaService = inject(LoteriaService);
  private toastr = inject(ToastrService);

  showCardModal = false;
  currentDrawnCard = '';
  lastDrawnCard = '';

  // Drag and drop
  draggedTokenIndex: number | null = null;
  availableTokens: number[] = [];

  ngOnInit() {
    this.updateAvailableTokens();

    // Escuchar cambios en la carta actual para mostrar modal
    this.watchCurrentCard();
  }

  updateAvailableTokens() {
    const tokensUsed = this.viewModel.myTokensUsed();
    const totalTokens = 16;
    this.availableTokens = Array.from({ length: totalTokens - tokensUsed }, (_, i) => i);
  }

  watchCurrentCard() {
    let previousCard = this.viewModel.currentCard();

    setInterval(() => {
      const currentCard = this.viewModel.currentCard();
      if (currentCard && currentCard !== previousCard) {
        this.showNewCardModal(currentCard);
        previousCard = currentCard;
      }
    }, 500);
  }

  showNewCardModal(cardName: string) {
    this.currentDrawnCard = cardName;
    this.showCardModal = true;

    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      this.showCardModal = false;
    }, 3000);
  }

  // ========================================
  // DRAG AND DROP
  // ========================================

  onTokenDragStart(event: DragEvent, tokenIndex: number) {
    this.draggedTokenIndex = tokenIndex;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tokenIndex.toString());
    }
  }

  onCellDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onCellDrop(event: DragEvent, cellIndex: number) {
    event.preventDefault();

    if (this.draggedTokenIndex === null) return;

    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;

    // Verificar si la celda ya tiene ficha
    if (this.viewModel.isCellMarked(row, col)) {
      this.toastr.warning('Esta casilla ya tiene una ficha');
      return;
    }

    this.placeToken(row, col);
    this.draggedTokenIndex = null;
  }

  // ========================================
  // COLOCAR FICHAS
  // ========================================

  onCellClick(cellIndex: number) {
    if (this.availableTokens.length === 0) {
      this.toastr.warning('No tienes más fichas disponibles');
      return;
    }

    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;

    if (this.viewModel.isCellMarked(row, col)) {
      this.toastr.warning('Esta casilla ya tiene una ficha');
      return;
    }

    this.placeToken(row, col);
  }

  placeToken(row: number, col: number) {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.placeToken(gameId, { row, col }).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.updateAvailableTokens();

        // Si se completó automáticamente, mostrar mensaje
        if (response.autoClaimWin) {
          if (response.isValid) {
            this.toastr.success('¡LOTERÍA! Has ganado la partida', '', { timeOut: 5000 });
          } else {
            this.toastr.error('Tu carta no es válida para ganar');
          }
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al colocar ficha');
      }
    });
  }

  // ========================================
  // RECLAMAR VICTORIA
  // ========================================

  claimWin() {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    if (confirm('¿Estás seguro de que tienes LOTERÍA?')) {
      this.loteriaService.claimWin(gameId).subscribe({
        next: (response) => {
          if (response.isValid) {
            this.toastr.success('¡LOTERÍA! Has ganado la partida', '', { timeOut: 5000 });
          } else {
            this.toastr.error('Tu carta no es válida para ganar');
          }
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al reclamar victoria');
        }
      });
    }
  }

  // ========================================
  // GETTERS
  // ========================================

  get canClaimWin(): boolean {
    return this.viewModel.myTokensUsed() === 16 && this.viewModel.isInGame();
  }

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

  getFichaImagePath(): string {
    return '/assets/Ficha.png'; // Sin mayúscula y en la raíz de assets
  }

  formatCardName(cardName: string): string {
    return cardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
