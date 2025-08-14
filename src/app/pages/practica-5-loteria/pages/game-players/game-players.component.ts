import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoteriaViewModel } from '../../view-models/loteriaViewmodel';
import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { LoteriaCardComponent } from '../../components/loteria-card/loteria-card.component';
import { LoteriaPlayerInfo } from '../../models/loteria.model';

@Component({
  standalone: true,
  selector: 'app-game-players',
  imports: [CommonModule, LoteriaCardComponent],
  templateUrl: './game-players.component.html',
  styleUrls: ['./game-players.component.scss']
})
export class GamePlayersComponent implements OnInit {
  @Input() viewModel!: LoteriaViewModel;
    @Output() showVictoryModal = new EventEmitter<string>();
  @Output() showCheaterSelfModal = new EventEmitter<string>();

  private loteriaService = inject(LoteriaService);

  showCardModal = false;
  currentDrawnCard = '';
  lastDrawnCard = '';

  draggedTokenIndex: number | null = null;
  availableTokens: number[] = [];

  ngOnInit() {
    this.updateAvailableTokens();
    this.watchCurrentCard();
  }

  /**
   * Actualiza la cantidad de fichas disponibles basándose en las fichas usadas
   */
  updateAvailableTokens() {
    const tokensUsed = this.viewModel.myTokensUsed();
    const totalTokens = 16;
    this.availableTokens = Array.from({ length: totalTokens - tokensUsed }, (_, i) => i);
  }

  /**
   * Observa cambios en la carta actual y muestra modales cuando cambia
   */
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

  /**
   * Muestra modal con nueva carta sacada
   * @param cardName - Nombre de la carta
   */
  showNewCardModal(cardName: string) {
    this.currentDrawnCard = cardName;
  }

  /**
   * Inicia el drag de una ficha
   * @param event - Evento de drag
   * @param tokenIndex - Índice de la ficha
   */
  onTokenDragStart(event: DragEvent, tokenIndex: number) {
    this.draggedTokenIndex = tokenIndex;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tokenIndex.toString());
    }
  }

  /**
   * Permite el drop de fichas sobre las celdas
   * @param event - Evento de drag over
   */
  onCellDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Maneja el drop de fichas en las celdas
   * @param event - Evento de drop
   * @param cellIndex - Índice de la celda
   */
  onCellDrop(event: DragEvent, cellIndex: number) {
    event.preventDefault();

    if (this.draggedTokenIndex === null) return;

    if (this.viewModel.isSpectator()) {
      console.warn('Estás en modo espectador y no puedes colocar fichas');
      this.draggedTokenIndex = null;
      return;
    }

    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;

    if (this.viewModel.isCellMarked(row, col)) {
      console.warn('Esta casilla ya tiene una ficha');
      this.draggedTokenIndex = null;
      return;
    }

    this.placeToken(row, col);
    this.draggedTokenIndex = null;
  }

  /**
   * Maneja el click en las celdas para colocar fichas
   * @param cellIndex - Índice de la celda clickeada
   */
  onCellClick(cellIndex: number) {
    if (this.viewModel.isSpectator()) {
      console.warn('Estás en modo espectador y no puedes colocar fichas');
      return;
    }

    if (this.availableTokens.length === 0) {
      console.warn('No tienes más fichas disponibles');
      return;
    }

    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;

    if (this.viewModel.isCellMarked(row, col)) {
      console.warn('Esta casilla ya tiene una ficha');
      return;
    }

    this.placeToken(row, col);
  }

  /**
   * Coloca una ficha en la posición especificada
   * @param row - Fila donde colocar la ficha
   * @param col - Columna donde colocar la ficha
   */
  placeToken(row: number, col: number) {
    const gameId = this.viewModel.gameId();
    if (!gameId) return;

    this.loteriaService.placeToken(gameId, { row, col }).subscribe({
      next: (response) => {
        console.log(response.message);
        this.updateAvailableTokens();

        if (response.autoClaimWin) {
          if (response.isValid) {
            this.showVictoryModal.emit(response.playerName || 'Tú');
            console.log('¡LOTERÍA VÁLIDA! Has ganado la partida');
          } else {
            this.showCheaterSelfModal.emit(response.playerName || 'Tú');
            console.warn('¡TRAMPA! Fuiste baneado por hacer trampa');
          }
        }
      },
      error: (error) => {
        console.error(error.error?.message || 'Error al colocar ficha');
      }
    });
  }

  /**
   * Permite al jugador abandonar la partida
   */
    leaveGame() {
      if (confirm('¿Estás seguro de que quieres abandonar la partida? Te convertirás en espectador.')) {
        const gameId = this.viewModel.gameId();
        if (!gameId) return;

        this.loteriaService.leaveGame(gameId).subscribe({
          next: (response) => {
            console.log(response.message);

            if (response.gameEnded) {
              if (response.winnerByDefault) {
                console.log('La partida terminó porque solo quedaba un jugador');
              } else {
                console.warn('La partida terminó porque el anfitrión abandonó');
              }
              setTimeout(() => {
                window.location.href = '/games/loteria';
              }, 2000);
            } else {
              console.log('Ahora eres espectador. Puedes seguir viendo la partida.');
              window.location.reload();
            }
          },
          error: (error) => {
            console.error(error.error?.message || 'Error al abandonar');
          }
        });
      }
    }

  /**
   * Muestra modal de jugador tramposo
   * @param playerName - Nombre del jugador
   */
  private showCheaterModal(playerName: string) {
    this.showCheaterSelfModal.emit(playerName);
  }

  /**
   * Getter seguro para información de jugadores
   * @returns Array con información de jugadores
   */
  get playersInfoSafe(): LoteriaPlayerInfo[] {
    return this.viewModel.playersInfo();
  }

  /**
   * Obtiene la ruta de la imagen de una carta específica
   * @param cardName - Nombre de la carta
   * @returns Ruta de la imagen
   */
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

  /**
   * Obtiene la ruta de la imagen de las fichas
   * @returns Ruta de la imagen de ficha
   */
  getFichaImagePath(): string {
    return '/assets/Ficha.png';
  }

  /**
   * Formatea el nombre de una carta para mostrar
   * @param cardName - Nombre de la carta con guiones bajos
   * @returns Nombre formateado con mayúsculas
   */
  formatCardName(cardName: string): string {
    return cardName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
