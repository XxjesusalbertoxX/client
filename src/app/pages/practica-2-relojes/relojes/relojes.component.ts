import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { SidebarComponent } from '../../../shared/components/layouts/sidebar/sidebar.component'
import { ClockCardComponent } from '../components/clock-card/clock-card.component'
import { ClockViewModel, ClockColors, ClockTime } from '../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-relojes',
  imports: [CommonModule, FormsModule, SidebarComponent, ClockCardComponent],
  templateUrl: './relojes.component.html',
  styleUrls: ['./relojes.component.scss']
})
export class RelojesComponent implements OnInit {

  showForm = true // Mostrar formulario inicialmente para crear el primer reloj
  clocks: ClockViewModel[] = []

  // Formulario inicial
  initialTime: ClockTime = {
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds()
  }

  initialColors: ClockColors = {
    analogBorder: '#2563eb',
    analogBackground: '#f8fafc',
    analogNumbers: '#1e293b',
    analogDots: '#64748b',
    analogCenter: '#dc2626',
    hourHand: '#1e293b',
    minuteHand: '#374151',
    secondHand: '#dc2626',
    digitalBorder: '#2563eb',
    digitalBackground: '#0f172a',
    digitalNumbers: '#00ff41',
    digitalShadow: '#00ff41'
  }

  ngOnInit(): void {
    // NO crear reloj por defecto - el usuario debe crear el primero
  }

    // ...existing code...
    createClock(): void {
      const viewModel = new ClockViewModel(
        { ...this.initialTime },
        { ...this.initialColors }
      )

      // NO iniciar en tiempo real automáticamente
      // El usuario decidirá si quiere tiempo real desde el modal

      this.clocks.push(viewModel)
      this.showForm = false
    }
  // ...existing code...

  addNewClock(): void {
    // Resetear valores a tiempo actual
    this.initialTime = {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
      seconds: new Date().getSeconds()
    }
    this.showForm = true
  }

  removeClock(index: number): void {
    if (this.clocks[index]) {
      this.clocks[index].destroy()
      this.clocks.splice(index, 1)
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm
  }
}
