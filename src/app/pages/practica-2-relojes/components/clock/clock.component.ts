import { Component, Input, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HandComponent } from '../hand/hand.component'
import { TimeModel, ThemeModel, createThemeModel } from '../../view-models/view-model'
import { AuthService } from '../../../../services/auth.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-clock',
  imports: [CommonModule, HandComponent],
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {
  @Input() time?: TimeModel
  @Input() initialTheme?: ThemeModel

  private authService = inject(AuthService)
  private router = inject(Router)

  theme: ThemeModel = createThemeModel()
  numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  dots = Array.from({ length: 60 }, (_, i) => i)

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
    this.theme = this.initialTheme ? { ...this.initialTheme } : createThemeModel()
  }

  getNumeroStyle(n: number) {
    const angle = n * 30
    const radius = 42 // Mismo radio que los puntos para que estén alineados
    const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180)
    const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180)

    return {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      color: this.theme.numeros,
      'font-weight': 'bold',
      'font-size': '16px',
      'z-index': '10' // Para que aparezcan sobre los puntos
    }
  }

  getPuntoStyle(i: number) {
    if (i % 5 === 0) {
      return { display: 'none' } // cada 30 grados se oculta el punto donde van los números
    }

    const angle = i * 6
    const radius = 42
    const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180)
    const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180)

    return {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: '4px', // Puntos más grandes
      height: '4px', // Puntos más grandes
      'background-color': this.theme.puntos,
      'border-radius': '50%',
      transform: 'translate(-50%, -50%)',
      'z-index': '5'
    }
  }
}
