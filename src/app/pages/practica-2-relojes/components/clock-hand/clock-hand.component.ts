import { Component, Input, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common'

export type HandType = 'hour' | 'minute' | 'second'

@Component({
  standalone: true,
  selector: 'app-clock-hand',
  imports: [CommonModule],
  templateUrl: './clock-hand.component.html',
  styleUrls: ['./clock-hand.component.scss']
})
export class ClockHandComponent implements OnChanges {
  @Input() type: HandType = 'hour'
  @Input() angle: number = 0
  @Input() color: string = '#000000'

  ngOnChanges(): void {
    // Los cambios se reflejan automáticamente
  }

  getHandClasses(): string {
    switch (this.type) {
      case 'hour':
        return 'w-1 h-6 rounded-sm'
      case 'minute':
        return 'w-0.5 h-9 rounded-sm'
      case 'second':
        return 'w-px h-10 rounded-full'
      default:
        return 'w-0.5 h-8 rounded-sm'
    }
  }
}
