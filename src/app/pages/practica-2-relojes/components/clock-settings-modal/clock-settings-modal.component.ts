import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { ClockViewModel, ClockColors, ClockTime } from '../../view-models/view-model'
import { AnalogClockComponent } from '../analog-clock/analog-clock.component'
import { DigitalClockComponent } from '../digital-clock/digital-clock.component'

@Component({
  standalone: true,
  selector: 'app-clock-settings-modal',
  imports: [CommonModule, FormsModule, AnalogClockComponent, DigitalClockComponent],
  templateUrl: './clock-settings-modal.component.html',
  styleUrls: ['./clock-settings-modal.component.scss']
})
export class ClockSettingsModalComponent implements OnInit, OnDestroy {
  @Input() viewModel!: ClockViewModel
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()

  // Copias locales para el formulario
  colors: ClockColors = {} as ClockColors
  time: ClockTime = {} as ClockTime

  private subscriptions = new Subscription()

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Inicializar con valores actuales
    this.colors = { ...this.viewModel.colors }
    this.time = { ...this.viewModel.time }

    // Suscribirse a cambios del viewModel para mantener sincronización
    this.subscriptions.add(
      this.viewModel.timeChanged$.subscribe((newTime) => {
        this.time = { ...newTime }
        this.cdr.detectChanges()
      })
    )

    this.subscriptions.add(
      this.viewModel.colorsChanged$.subscribe((newColors) => {
        this.colors = { ...newColors }
        this.cdr.detectChanges()
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
    // Cambio inmediato en tiempo real - EL RELOJ SIGUE MOVIÉNDOSE
    this.viewModel.setTime(this.time)
  }

  onClose(): void {
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
    this.viewModel.startRealTime()
  }

  stopRealTime(): void {
    this.viewModel.stopRealTime()
  }

  // Métodos para ajustar tiempo manualmente (LÓGICA CORREGIDA)
  addSeconds(seconds: number): void {
    this.viewModel.addSeconds(seconds)
  }

  addMinutes(minutes: number): void {
    this.viewModel.addMinutes(minutes)
  }

  addHours(hours: number): void {
    this.viewModel.addHours(hours)
  }
}
