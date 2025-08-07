import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { ClockViewModel, ClockColors, ClockTime } from '../../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-clock-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './clock-settings.component.html',
  styleUrls: ['./clock-settings.component.scss']
})
export class ClockSettingsComponent implements OnInit, OnDestroy {
  @Input() viewModel!: ClockViewModel
  @Output() close = new EventEmitter<void>()

  // Copias locales para el formulario
  colors: ClockColors = {} as ClockColors
  time: ClockTime = {} as ClockTime

  private subscriptions = new Subscription()
  private wasRealTime = false

  ngOnInit(): void {
    // Guardar estado de tiempo real
    this.wasRealTime = this.viewModel.isRealTime

    // Si estaba en tiempo real, pausarlo para poder editar
    if (this.wasRealTime) {
      this.viewModel.stopRealTime()
    }

    // Inicializar con valores actuales
    this.colors = { ...this.viewModel.colors }
    this.time = { ...this.viewModel.time }

    // Suscribirse a cambios del viewModel para mantener sincronización
    this.subscriptions.add(
      this.viewModel.timeChanged$.subscribe((newTime) => {
        this.time = { ...newTime }
      })
    )

    this.subscriptions.add(
      this.viewModel.colorsChanged$.subscribe((newColors) => {
        this.colors = { ...newColors }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  onColorChange(property: keyof ClockColors, value: string): void {
    // Cambio inmediato en tiempo real
    this.colors[property] = value
    this.viewModel.setColors({ [property]: value })
  }

  onTimeChange(): void {
    // Cambio inmediato en tiempo real
    this.viewModel.setTime(this.time)
  }

  onClose(): void {
    // Restaurar tiempo real si estaba activado
    if (this.wasRealTime) {
      this.viewModel.startRealTime()
    }
    this.close.emit()
  }

  resetToDefaults(): void {
    const defaultColors: ClockColors = {
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

    this.colors = { ...defaultColors }
    this.viewModel.setColors(defaultColors)
  }

  startRealTime(): void {
    this.wasRealTime = true
    this.viewModel.startRealTime()
  }

  stopRealTime(): void {
    this.wasRealTime = false
    this.viewModel.stopRealTime()
  }

  // Métodos para ajustar tiempo manualmente
  addSeconds(seconds: number): void {
    const newSeconds = (this.time.seconds + seconds + 60) % 60
    const minuteCarry = Math.floor((this.time.seconds + seconds) / 60)

    this.time.seconds = newSeconds
    if (minuteCarry !== 0) {
      this.addMinutes(minuteCarry)
    } else {
      this.onTimeChange()
    }
  }

  addMinutes(minutes: number): void {
    const newMinutes = (this.time.minutes + minutes + 60) % 60
    const hourCarry = Math.floor((this.time.minutes + minutes) / 60)

    this.time.minutes = newMinutes
    if (hourCarry !== 0) {
      this.addHours(hourCarry)
    } else {
      this.onTimeChange()
    }
  }

  addHours(hours: number): void {
    this.time.hours = (this.time.hours + hours + 24) % 24
    this.onTimeChange()
  }
}
