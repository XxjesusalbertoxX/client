import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-loteria-card',
  imports: [CommonModule],
  templateUrl: './loteria-card.component.html',
  styleUrls: ['./loteria-card.component.scss']
})
export class LoteriaCardComponent {
  @Input() playerCard: string[] = [];
  @Input() markedCells: boolean[] = [];
  @Input() tokensUsed?: number;
  @Input() showTokens: boolean = false;
  @Input() showCardNames: boolean = false;
  @Input() clickable: boolean = false;
  
  @Output() cellClick = new EventEmitter<number>();

  onCellClick(index: number) {
    if (this.clickable) {
      this.cellClick.emit(index);
    }
  }

  getCardImagePath(cardName: string): string {
    // Convertir de formato del backend a formato de archivo
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

  onImageError(event: any) {
    // Fallback a una imagen por defecto si no se encuentra
    event.target.src = '/assets/Cartas/01 el gallo.jpg';
  }
}