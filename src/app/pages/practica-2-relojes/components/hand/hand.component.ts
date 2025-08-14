import { Component, Input, OnChanges, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../../../services/auth.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-hand',
  imports: [CommonModule],
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnInit, OnChanges {
  @Input() type!: string
  @Input() value!: number
  @Input() color!: string

  private authService = inject(AuthService)
  private router = inject(Router)

  rotation = 0
  height = '40%'
  topOffset = '10%'
  width = '2px'

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  ngOnChanges(): void {
    this.calculateProperties()
  }

  private calculateProperties(): void {
    // Calcular rotación y propiedades según el tipo
    if (this.type === 'hour') {
      this.rotation = this.value * 30
      this.height = '25%'
      this.topOffset = '25%'
      this.width = '4px' // Manecilla de hora más gruesa
    } else if (this.type === 'minute') {
      this.rotation = this.value * 6
      this.height = '35%'
      this.topOffset = '15%'
      this.width = '3px' // Manecilla de minuto intermedia
    } else if (this.type === 'second') {
      this.rotation = this.value * 6
      this.height = '40%'
      this.topOffset = '10%'
      this.width = '2px' // Manecilla de segundo más delgada
    } else {
      this.rotation = 0
    }
  }

  get handStyle() {
    return {
      transform: `rotate(${this.rotation}deg)`,
      'background-color': this.color,
      height: this.height,
      top: this.topOffset,
      width: this.width
    }
  }
}
