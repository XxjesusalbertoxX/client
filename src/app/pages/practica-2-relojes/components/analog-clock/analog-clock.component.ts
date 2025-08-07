import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subscription } from 'rxjs'
import { ClockHandComponent } from '../clock-hand/clock-hand.component'
import { ClockViewModel } from '../../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-analog-clock',
  imports: [CommonModule, ClockHandComponent],
  templateUrl: './analog-clock.component.html',
  styleUrls: ['./analog-clock.component.scss']
})
export class AnalogClockComponent implements OnInit, OnDestroy {
  @Input() viewModel!: ClockViewModel

  hours: number[] = []
  dots: number[] = []
  angles = { hour: 0, minute: 0, second: 0 }

  private subscriptions = new Subscription()

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.generateClockElements()
    this.updateAngles()

    // Suscribirse a cambios de tiempo para actualizar ángulos
    this.subscriptions.add(
      this.viewModel.timeChanged$.subscribe(() => {
        this.updateAngles()
        this.cdr.detectChanges()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  private generateClockElements(): void {
    this.hours = Array.from({ length: 12 }, (_, i) => i + 1)
    this.dots = Array.from({ length: 60 }, (_, i) => i)
  }

  private updateAngles(): void {
    this.angles = this.viewModel.getAngles()
  }

  getHourPosition(hour: number): { top: string, left: string } {
    const angle = (hour * 30 - 90) * (Math.PI / 180)
    const radius = 35
    const x = Math.cos(angle) * radius + 50
    const y = Math.sin(angle) * radius + 50

    return {
      top: y + '%',
      left: x + '%'
    }
  }

  getDotPosition(dot: number): { top: string, left: string, transform: string } {
    const angle = (dot * 6 - 90) * (Math.PI / 180)
    const radius = 45
    const x = Math.cos(angle) * radius + 50
    const y = Math.sin(angle) * radius + 50

    return {
      top: y + '%',
      left: x + '%',
      transform: 'translate(-50%, -50%)'
    }
  }
}
