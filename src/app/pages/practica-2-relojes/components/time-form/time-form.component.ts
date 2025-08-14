import { Component, Output, EventEmitter, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TimeModel, ThemeModel, createTimeModel, createThemeModel } from '../../view-models/view-model'
import { AuthService } from '../../../../services/auth.service'
import { Router } from '@angular/router'

interface ClockConfig {
  time: TimeModel
  theme: ThemeModel
}

@Component({
  standalone: true,
  selector: 'app-time-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './time-form.component.html',
  styleUrls: ['./time-form.component.scss']
})
export class TimeFormComponent {
  @Output() addClock = new EventEmitter<ClockConfig>()

  private authService = inject(AuthService)
  private router = inject(Router)

  localTime = createTimeModel(0, 0, 0)
  localTheme = createThemeModel()

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  onAdd(): void {
    this.addClock.emit({
      time: { ...this.localTime },
      theme: { ...this.localTheme }
    })
  }
}
