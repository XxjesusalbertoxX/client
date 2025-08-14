import { Component, OnInit, inject} from '@angular/core'
import { CommonModule} from '@angular/common'
import { LogsService } from '../../../../services/logs.service'
import { LogEntry, LogsResponse } from '../../../../models/log.model'
import { SidebarComponent } from '../../../../shared/components/layouts/sidebar/sidebar.component'
import { SessionGuardService } from '../../../../services/guards/session.guard.service'
import { Router } from '@angular/router'
import { RouterModule } from '@angular/router'
import { AuthService } from '../../../../services/auth.service'

@Component({
  standalone: true,
  selector: 'app-logs',
  imports: [CommonModule, SidebarComponent, RouterModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  private logsService = inject(LogsService)
  private sessionGuard = inject(SessionGuardService)
  private router = inject(Router)
  private authService = inject(AuthService)

  logs: LogEntry[] = []
  loading = false
  page = 1
  total = 0
  perPage = 10  // Cambiado de 15 a 10 como en personas
  lastPage = 1

  async ngOnInit(): Promise<void> {
    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
    this.loadLogs()
  }

  backToPerson(){
    this.router.navigate(['/people'])
  }

  /**
   * Carga los logs con paginación
   * @param page - Número de página a cargar
   */
  loadLogs(page: number = 1) {
    this.loading = true
    this.page = page

    this.logsService.getLogs(page, this.perPage).subscribe({
      next: (response: LogsResponse) => {
        console.log('[LogsComponent] Respuesta recibida:', response)

        this.logs = response.data || []
        this.total = response.total || 0
        this.perPage = response.perPage || this.perPage
        this.lastPage = response.lastPage || Math.max(1, Math.ceil(this.total / this.perPage))

        if (page > this.lastPage && this.lastPage > 0) {
          this.page = this.lastPage
          this.loadLogs(this.lastPage)
          return
        }

        this.page = Math.max(1, Math.min(page, this.lastPage))
        this.loading = false

        console.log('[LogsComponent] Estado actualizado:', {
          page: this.page,
          total: this.total,
          lastPage: this.lastPage,
          logsCount: this.logs.length
        })
      },
      error: (err) => {
        console.error('Error loading logs:', err)
        this.loading = false

        this.page = 1
        this.logs = []
        this.total = 0
        this.lastPage = 1
      }
    })
  }

  /**
   * Navega a una ruta específica
   * @param path - Ruta a la que navegar
   */
  navigateTo(path: string) {
    this.router.navigate([path])
  }

  /**
   * Cambia a una página específica
   * @param newPage - Número de la nueva página
   */
  changePage(newPage: number) {
    if (newPage < 1) {
      console.warn('[LogsComponent] Página solicitada menor a 1:', newPage)
      return
    }

    if (newPage > this.lastPage) {
      console.warn('[LogsComponent] Página solicitada mayor a la última:', newPage, 'lastPage:', this.lastPage)
      return
    }

    if (newPage === this.page) {
      console.log('[LogsComponent] Ya estamos en la página solicitada:', newPage)
      return
    }

    console.log('[LogsComponent] Cambiando a página:', newPage)
    this.loadLogs(newPage)
  }

  /**
   * Va a la primera página disponible después de cambios en la paginación
   */
  goToFirstAvailablePage() {
    if (this.total === 0) {
      this.page = 1
      this.lastPage = 1
      this.logs = []
      return
    }

    const newLastPage = Math.ceil(this.total / this.perPage)
    this.lastPage = newLastPage

    if (this.page > newLastPage) {
      this.loadLogs(newLastPage)
    }
  }

  /**
   * Refresca los datos de la página actual
   */
  refresh() {
    this.loadLogs(this.page)
  }

  /**
   * Obtiene el icono apropiado para cada tipo de acción
   * @param action - Tipo de acción del log
   * @returns Emoji del icono correspondiente
   */
  getActionIcon(action: string): string {
    switch (action) {
      case 'create': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      default: return '📝'
    }
  }

  /**
   * Obtiene las clases CSS para colorear cada tipo de acción
   * @param action - Tipo de acción del log
   * @returns Clases CSS para el color
   */
  getActionColor(action: string): string {
    switch (action) {
      case 'create': return 'text-green-400 bg-green-500/20'
      case 'update': return 'text-yellow-400 bg-yellow-500/20'
      case 'delete': return 'text-red-400 bg-red-500/20'
      default: return 'text-blue-400 bg-blue-500/20'
    }
  }

  /**
   * Formatea una fecha para mostrar
   * @param date - Fecha a formatear
   * @returns Fecha formateada como string
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtiene una vista previa de los metadatos del log
   * @param metadata - Metadatos del log
   * @returns String con preview de los metadatos
   */
  getMetadataPreview(metadata: any): string {
    if (!metadata) return ''

    if (metadata.person_id) {
      return `ID: ${metadata.person_id}`
    }

    if (metadata.data) {
      const data = metadata.data
      return `${data.firstName || ''} ${data.lastName || ''}`.trim()
    }

    return 'Ver detalles'
  }

  /**
   * Información de paginación para mostrar en el template
   * @returns String con información de paginación
   */
  get paginationInfo(): string {
    if (this.total === 0) return 'Sin registros'

    const start = ((this.page - 1) * this.perPage) + 1
    const end = Math.min(this.page * this.perPage, this.total)

    return `${start}-${end} de ${this.total} registros`
  }

  /**
   * Indica si se puede navegar a la página anterior
   * @returns true si se puede ir a página anterior
   */
  get canGoToPrevious(): boolean {
    return this.page > 1 && !this.loading
  }

  /**
   * Indica si se puede navegar a la página siguiente
   * @returns true si se puede ir a página siguiente
   */
  get canGoToNext(): boolean {
    return this.page < this.lastPage && !this.loading
  }
}
