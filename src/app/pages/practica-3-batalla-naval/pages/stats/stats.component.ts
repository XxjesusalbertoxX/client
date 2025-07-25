import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleshipStatsService } from '../../../../services/gameservices/battleship-stats.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { BoardComponent } from '../../components/board/board.component'; // Importar el BoardComponent
import { 
  BattleshipStatsResponse, 
  BattleshipGameSummary, 
  BattleshipGameDetails 
} from '../../models/battle-ship.model';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-stats',
  imports: [CommonModule, SidebarComponent, BoardComponent],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  private statsService = inject(BattleshipStatsService);
  
  stats = signal<BattleshipStatsResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modales
  showGamesModal = signal(false);
  selectedGames = signal<BattleshipGameSummary[]>([]);
  modalTitle = signal('');
  
  showGameDetails = signal(false);
  gameDetails = signal<BattleshipGameDetails | null>(null);
  loadingDetails = signal(false);
  
  chart: Chart | null = null;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);
    
    this.statsService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
        setTimeout(() => this.createChart(), 100); // Delay para que el canvas esté listo
      },
      error: (err) => {
        this.error.set('Error al cargar estadísticas');
        this.loading.set(false);
        console.error('Error loading stats:', err);
      }
    });
  }

  createChart() {
    const canvas = document.getElementById('statsChart') as HTMLCanvasElement;
    if (!canvas || !this.stats()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const stats = this.stats()!;
    
    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['Victorias', 'Derrotas'],
        datasets: [{
          label: 'Partidas',
          data: [stats.wins, stats.losses],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',  // Verde para victorias
            'rgba(239, 68, 68, 0.8)'   // Rojo para derrotas
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              stepSize: 1
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.onBarClick(index);
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  onBarClick(index: number) {
    const stats = this.stats();
    if (!stats) return;

    if (index === 0) {
      // Victorias
      this.selectedGames.set(stats.wonGames);
      this.modalTitle.set('🏆 Partidas Ganadas');
    } else {
      // Derrotas
      this.selectedGames.set(stats.lostGames);
      this.modalTitle.set('💔 Partidas Perdidas');
    }
    
    this.showGamesModal.set(true);
  }

  viewGameDetails(game: BattleshipGameSummary) {
    this.loadingDetails.set(true);
    this.showGameDetails.set(true);
    
    this.statsService.getGameDetails(game.gameId).subscribe({
      next: (details) => {
        this.gameDetails.set(details);
        this.loadingDetails.set(false);
      },
      error: (err) => {
        console.error('Error loading game details:', err);
        this.loadingDetails.set(false);
        this.showGameDetails.set(false);
      }
    });
  }

  closeModals() {
    this.showGamesModal.set(false);
    this.showGameDetails.set(false);
    this.gameDetails.set(null);
  }

  getCellClass(value: number): string {
    switch (value) {
      case 0: return 'bg-blue-500/30 border-blue-400'; // Agua
      case 1: return 'bg-gray-600 border-gray-500'; // Barco
      case 2: return 'bg-red-500 border-red-400'; // Barco hundido
      case 3: return 'bg-yellow-500 border-yellow-400'; // Agua disparada
      default: return 'bg-gray-500 border-gray-400';
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}