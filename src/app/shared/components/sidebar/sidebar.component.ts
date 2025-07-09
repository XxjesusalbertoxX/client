import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Router } from '@angular/router'
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'
import { AuthService } from '../../../services/auth.service'

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class SidebarComponent {
  isOpen = false

  private authService = inject(AuthService)
  private router = inject(Router)

  toggleSidebar() {
    this.isOpen = !this.isOpen
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
