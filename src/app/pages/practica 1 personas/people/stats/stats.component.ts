import { Component, OnInit, inject, AfterViewInit, ElementRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PeopleService } from '../../../../services/people.service'
import { StatsResponse, ChartData } from '../../../../models/stats.model'
import { SidebarComponent } from '../../../../shared/components/layouts/sidebar/sidebar.component'
import { SessionGuardService } from '../../../../services/guards/session.guard.service'

@Component({
  standalone: true,
  selector: 'app-stats',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, AfterViewInit {
  private peopleService = inject(PeopleService)
  private sessionGuard = inject(SessionGuardService)
  private elementRef = inject(ElementRef)

  loading = false
  stats: StatsResponse | null = null

  // Datos para las gráficas
  genderData: ChartData[] = []
  ageData: ChartData[] = []
  combinedData: ChartData[] = []

  ngOnInit(): void {
    if (!this.sessionGuard.checkSessionOrRedirect()) return
    this.loadStats()
  }

  ngAfterViewInit(): void {
    // Se ejecuta después de que las barras estén en el DOM
    this.updateChartHeights()
  }

  loadStats() {
    this.loading = true
    this.peopleService.getStatistics().subscribe({
      next: (res) => {
        this.stats = res
        this.prepareChartData()
        this.loading = false
        // Actualizar alturas después de cargar datos
        setTimeout(() => this.updateChartHeights(), 100)
      },
      error: (err) => {
        console.error('Error loading stats:', err)
        this.loading = false
      }
    })
  }

  private prepareChartData() {
    if (!this.stats) return

    // Datos de género
    this.genderData = [
      { label: 'Masculino', value: this.stats.gender.male, color: '#3B82F6' },
      { label: 'Femenino', value: this.stats.gender.female, color: '#EC4899' }
    ]

    // Datos de edad
    this.ageData = [
      { label: 'Adultos', value: this.stats.age.adult, color: '#10B981' },
      { label: 'Menores', value: this.stats.age.minor, color: '#F59E0B' }
    ]

    // Datos combinados
    this.combinedData = [
      { label: 'Hombres Adultos', value: this.stats.combined.maleAdult, color: '#1E40AF' },
      { label: 'Hombres Menores', value: this.stats.combined.maleMinor, color: '#60A5FA' },
      { label: 'Mujeres Adultas', value: this.stats.combined.femaleAdult, color: '#BE185D' },
      { label: 'Mujeres Menores', value: this.stats.combined.femaleMinor, color: '#F9A8D4' }
    ]
  }

  private updateChartHeights() {
    if (!this.stats) return

    const total = this.getTotalPeople()
    if (total === 0) return

    // Actualizar barras de género
    this.updateBarsHeight(this.genderData, total, 'gender')

    // Actualizar barras de edad
    this.updateBarsHeight(this.ageData, total, 'age')

    // Actualizar barras combinadas
    this.updateBarsHeight(this.combinedData, total, 'combined')
  }

  private updateBarsHeight(data: ChartData[], total: number, chartType: string) {
    data.forEach((item, index) => {
      const percentage = this.getPercentage(item.value, total)

      // Calcular altura con límites apropiados
      let height: number

      if (chartType === 'combined') {
        // Para gráficas combinadas: altura mínima 15px, máxima 100px
        height = Math.max(15, Math.min(100, (percentage / 100) * 100))
      } else {
        // Para gráficas simples: altura mínima 15px, máxima 120px
        height = Math.max(15, Math.min(120, (percentage / 100) * 120))
      }

      // Buscar y actualizar la barra correspondiente
      if (chartType === 'combined') {
        const combinedContainer = this.elementRef.nativeElement.querySelector(
          `.chart-container.combined .chart-item:nth-child(${index + 1}) .chart-bar`
        )
        if (combinedContainer) {
          combinedContainer.style.setProperty('--chart-height', `${height}px`)
          combinedContainer.style.height = `${height}px`
        }
      } else {
        // Para género y edad
        const containers = this.elementRef.nativeElement.querySelectorAll('.chart-container:not(.combined)')
        let targetContainer

        if (chartType === 'gender' && containers[0]) {
          targetContainer = containers[0].querySelector(`.chart-item:nth-child(${index + 1}) .chart-bar`)
        } else if (chartType === 'age' && containers[1]) {
          targetContainer = containers[1].querySelector(`.chart-item:nth-child(${index + 1}) .chart-bar`)
        }

        if (targetContainer) {
          targetContainer.style.setProperty('--chart-height', `${height}px`)
          targetContainer.style.height = `${height}px`
        }
      }
    })
  }

  getTotalPeople(): number {
    if (!this.stats) return 0
    return this.stats.gender.male + this.stats.gender.female
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0
  }
}
