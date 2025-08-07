import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { AnalogClockComponent } from '../analog-clock/analog-clock.component'
import { DigitalClockComponent } from '../digital-clock/digital-clock.component'
import { ClockViewModel, ClockColors } from '../../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-clock-card',
  imports: [CommonModule, FormsModule, AnalogClockComponent, DigitalClockComponent],
  templateUrl: './clock-card.component.html',
  styleUrls: ['./clock-card.component.scss']
})
export class ClockCardComponent implements OnInit, OnDestroy {
  @Input() viewModel!: ClockViewModel

  showSettings = false
  private subscriptions = new Subscription()

  // Referencias directas para binding
  get colors() { return this.viewModel.colors }
  get time() { return this.viewModel.time }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.viewModel.timeChanged$.subscribe(() => {
        this.cdr.detectChanges()
      })
    )

    this.subscriptions.add(
      this.viewModel.colorsChanged$.subscribe(() => {
        this.cdr.detectChanges()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings
  }

  // Métodos de configuración directos
  onColorChange(property: keyof ClockColors, value: string): void {
    this.viewModel.setColors({ [property]: value })
  }

  addSeconds(seconds: number): void {
    this.viewModel.addSeconds(seconds)
  }

  addMinutes(minutes: number): void {
    this.viewModel.addMinutes(minutes)
  }

  addHours(hours: number): void {
    this.viewModel.addHours(hours)
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
    this.viewModel.setColors(defaultColors)
  }

  startRealTime(): void {
    this.viewModel.startRealTime()
  }

  stopRealTime(): void {
    this.viewModel.stopRealTime()
  }
}
