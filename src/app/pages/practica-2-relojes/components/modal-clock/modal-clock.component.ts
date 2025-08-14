import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ClockComponent } from '../clock/clock.component'
import { TimeModel, ThemeModel, createTimeModel, createThemeModel } from '../../view-models/view-model'
import { AuthService } from '../../../../services/auth.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-modal-clock',
  imports: [CommonModule, FormsModule, ClockComponent],
  templateUrl: './modal-clock.component.html',
  styleUrls: ['./modal-clock.component.scss']
})
export class ModalClockComponent implements OnInit, OnDestroy {
  @Input() initialTime?: TimeModel
  @Input() initialTheme?: ThemeModel
  @Input() clockIndex?: number
  @Output() removeClock = new EventEmitter<number>()

  private authService = inject(AuthService)
  private router = inject(Router)

  time: TimeModel = createTimeModel()
  theme: ThemeModel = createThemeModel()
  editMode = false
  editThemeMode = false
  interval: any = null

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }

    // Inicializar props como en Vue
    this.time = this.initialTime ? { ...this.initialTime } : createTimeModel()
    this.theme = this.initialTheme ? { ...this.initialTheme } : createThemeModel()

    // Interval para actualizar la hora cada segundo
    this.interval = setInterval(() => {
      this.updateTime()
    }, 1000)
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  get digitalTime(): string {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(this.time.hours)}:${pad(this.time.minutes)}:${pad(this.time.seconds)}`
  }

  updateTime(): void {
    this.time.seconds++
    if (this.time.seconds >= 60) {
      this.time.seconds = 0
      this.time.minutes++
      if (this.time.minutes >= 60) {
        this.time.minutes = 0
        this.time.hours++
        if (this.time.hours >= 24) {
          this.time.hours = 0
        }
      }
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode
    if (this.editMode) {
      this.editThemeMode = false // Cerrar edición de tema si está abierta
    }
  }

  toggleThemeEdit(): void {
    this.editThemeMode = !this.editThemeMode
    if (this.editThemeMode) {
      this.editMode = false // Cerrar edición de tiempo si está abierta
    }
  }

  onRemove(): void {
    if (this.clockIndex !== undefined) {
      this.removeClock.emit(this.clockIndex)
    }
  }

  handleKey(prop: keyof TimeModel, min: number, max: number, event: KeyboardEvent): void {
    const key = event.key
    const time = { ...this.time }

    const increment = () => {
      if (prop === 'seconds') {
        time.seconds++
        if (time.seconds > max) {
          time.seconds = min
          time.minutes++
          if (time.minutes > 59) {
            time.minutes = 0
            time.hours++
            if (time.hours > 23) {
              time.hours = 0
            }
          }
        }
      } else if (prop === 'minutes') {
        time.minutes++
        if (time.minutes > max) {
          time.minutes = min
          time.hours++
          if (time.hours > 23) {
            time.hours = 0
          }
        }
      } else if (prop === 'hours') {
        time.hours++
        if (time.hours > max) {
          time.hours = min
        }
      }
    }

    const decrement = () => {
      if (prop === 'seconds') {
        time.seconds--
        if (time.seconds < min) {
          time.seconds = max
          time.minutes--
          if (time.minutes < 0) {
            time.minutes = 59
            time.hours--
            if (time.hours < 0) {
              time.hours = 23
            }
          }
        }
      } else if (prop === 'minutes') {
        time.minutes--
        if (time.minutes < min) {
          time.minutes = max
          time.hours--
          if (time.hours < 0) {
            time.hours = 23
          }
        }
      } else if (prop === 'hours') {
        time.hours--
        if (time.hours < min) {
          time.hours = max
        }
      }
    }

    if (key === 'ArrowUp') {
      event.preventDefault()
      increment()
    }
    if (key === 'ArrowDown') {
      event.preventDefault()
      decrement()
    }

    this.time = time
  }
}
