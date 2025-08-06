import { Component, OnInit, inject } from '@angular/core'
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
export class StatsComponent implements OnInit {
  private peopleService = inject(PeopleService)
  private sessionGuard = inject(SessionGuardService)

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

  loadStats() {
    this.loading = true
    this.peopleService.getStatistics().subscribe({
      next: (res) => {
        this.stats = res
        this.prepareChartData()
        this.loading = false
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

  getTotalPeople(): number {
    if (!this.stats) return 0
    return this.stats.gender.male + this.stats.gender.female
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0
  }
}
