import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subscription } from 'rxjs'
import { ClockViewModel } from '../../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-digital-clock',
  imports: [CommonModule],
  templateUrl: './digital-clock.component.html'
})
export class DigitalClockComponent implements OnInit, OnDestroy {
  @Input() viewModel!: ClockViewModel

  private subscriptions = new Subscription()

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Suscribirse a cambios de tiempo para actualizar inmediatamente
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
}
