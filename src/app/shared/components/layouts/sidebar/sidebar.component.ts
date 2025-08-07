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
import { AuthService } from '../../../../services/auth.service'

interface MenuItem {
  label: string
  icon: string
  route?: string
  children?: MenuItem[]
  isExpanded?: boolean
}

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
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', overflow: 'hidden' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('200ms ease-in-out'))
    ])
  ]
})
export class SidebarComponent {
  isOpen = false

  private authService = inject(AuthService)
  private router = inject(Router)

  menuItems: MenuItem[] = [
    {
      label: 'Práctica 1 - Personas',
      icon: '👥',
      isExpanded: false,
      children: [
        { label: 'Usuarios', icon: '👤', route: '/people' },
        { label: 'Estadísticas', icon: '📊', route: '/people/stats' },
        { label: 'Logs', icon: '📝', route: '/people/logs' }
      ]
    },
    {
      label: 'Práctica 2 - Relojes',
      icon: '⏰',
      isExpanded: false,
      children: [
        { label: 'Relojes', icon: '🕐', route: '/relojes' },
      ]
    },
    {
      label: 'Práctica 3 - Batalla Naval',
      icon: '⚔️',
      isExpanded: false,
      children: [
        { label: 'Crear Partida', icon: '🚢', route: '/games/battleship' },
        { label: 'Unirse a Partida', icon: '🌊', route: '/games/battleship/join' },
        { label: 'Estadísticas', icon: '📈', route: '/games/battleship/stats' }
      ]
    },
    {
      label: 'Práctica 4 - Simon Says',
      icon: '🎯',
      isExpanded: false,
      children: [
        { label: 'Crear Partida', icon: '🎮', route: '/games/simonsay' },
        { label: 'Unirse a Partida', icon: '🔗', route: '/games/simonsay/join' }
      ]
    },
    {
      label: 'Práctica 5 - Lotería',
      icon: '🎲',
      isExpanded: false,
      children: [
        { label: 'Crear Partida', icon: '🎪', route: '/games/loteria' },
        { label: 'Unirse a Partida', icon: '🎫', route: '/games/loteria/join' }
      ]
    }
  ]

  toggleSidebar() {
    this.isOpen = !this.isOpen
  }

  toggleCategory(item: MenuItem) {
    if (item.children) {
      item.isExpanded = !item.isExpanded
    }
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
