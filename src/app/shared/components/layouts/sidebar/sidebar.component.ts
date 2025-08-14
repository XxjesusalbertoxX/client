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

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  menuItems: MenuItem[] = [
    // CORREGIDO: Hacer Personas expandible pero con mejor organización
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
    // CORREGIDO: Relojes - ruta directa sin expansión
    {
      label: 'Práctica 2 - Relojes',
      icon: '⏰',
      route: '/relojes'
    },
    // CORREGIDO: Games - ruta directa sin expansión (más prominente)
    {
      label: 'Games',
      icon: '🎮',
      route: '/games'
    },
  ]

  toggleSidebar() {
    this.isOpen = !this.isOpen
  }

  toggleCategory(item: MenuItem) {
    // Solo expandir si tiene children
    if (item.children) {
      item.isExpanded = !item.isExpanded
    } else if (item.route) {
      // Si no tiene children pero sí route, navegar directamente
      this.router.navigate([item.route])
      // Cerrar sidebar en móvil después de navegar
      if (window.innerWidth < 768) {
        this.isOpen = false
      }
    }
  }

  // NUEVO: Método para manejar navegación de items de menú
  navigateToRoute(route: string) {
    this.router.navigate([route])
    // Cerrar sidebar en móvil después de navegar
    if (window.innerWidth < 768) {
      this.isOpen = false
    }
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
