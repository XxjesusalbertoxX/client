import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SidebarComponent } from '../../../shared/components/layouts/sidebar/sidebar.component'
import { AuthService } from '../../../services/auth.service'
import { Router } from '@angular/router'

// Importar los componentes equivalentes
import { TimeFormComponent } from '../components/time-form/time-form.component'
import { ModalClockComponent } from '../components/modal-clock/modal-clock.component'
import { ClockConfig } from '../view-models/view-model'

@Component({
  standalone: true,
  selector: 'app-relojes',
  imports: [
    CommonModule,
    SidebarComponent,
    TimeFormComponent,
    ModalClockComponent
  ],
  templateUrl: './relojes.component.html',
  styleUrls: ['./relojes.component.scss']
})
export class RelojesComponent implements OnInit {
  clocks: ClockConfig[] = []

  private authService = inject(AuthService)
  private router = inject(Router)

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  addClock(cfg: ClockConfig): void {
    this.clocks.push({
      time: { ...cfg.time },
      theme: { ...cfg.theme }
    })
  }

  removeClock(index: number): void {
    if (index >= 0 && index < this.clocks.length) {
      this.clocks.splice(index, 1)
    }
  }
}
