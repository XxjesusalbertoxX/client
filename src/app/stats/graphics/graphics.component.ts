import { Component, AfterViewInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PeopleService } from '../../services/people.service'
import { StatsResponse } from '../../models/stats.model' // ajusta la ruta según tu estructura


@Component({
  standalone: true,
  selector: 'app-stats',
  imports: [CommonModule],
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.scss']
})
export class StatComponent implements AfterViewInit {
  private peopleService = inject(PeopleService)

  ngAfterViewInit() {
    this.peopleService.getStatistics().subscribe((data: StatsResponse) => {
      console.log('Datos de estadísticas:', data)
      // Actualiza las barras con los datos recibidos
      if (data.gender) {
        this.updateBar('gender-male', data.gender.male, '#3b82f6')
        this.updateBar('gender-female', data.gender.female, '#ec4899')
      }
      if (data.age) {
        this.updateBar('age-adults', data.age.adult, '#10b981')
        this.updateBar('age-minors', data.age.minor, '#f59e0b')      }
      if (data.combined) {
        this.updateBar('combined-male-adults', data.combined.maleAdult, '#3b82f6')
        this.updateBar('combined-male-minors', data.combined.maleMinor, '#60a5fa')
        this.updateBar('combined-female-adults', data.combined.femaleAdult, '#ec4899')
        this.updateBar('combined-female-minors', data.combined.femaleMinor, '#f472b6')      }
    })
  }

  updateBar(id: string, value: number, color: string) {
    const bar = document.getElementById(id)
    const label = document.getElementById(`${id}-label`)

    if (bar) {
      bar.style.height = `${value * 4}px` // escala de altura
      bar.style.backgroundColor = color
    }

    if (label) {
      label.textContent = `${value}`
    }
  }


}

