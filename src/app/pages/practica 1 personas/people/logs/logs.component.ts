import { Component, OnInit, inject} from '@angular/core'
import { CommonModule} from '@angular/common'
import { LogsService } from '../../../../services/logs.service'
import { LogEntry, LogsResponse } from '../../../../models/log.model'
import { SidebarComponent } from '../../../../shared/components/layouts/sidebar/sidebar.component'
import { SessionGuardService } from '../../../../services/guards/session.guard.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-logs',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  private logsService = inject(LogsService)
  private sessionGuard = inject(SessionGuardService)
  private router = inject(Router)

  logs: LogEntry[] = []
  loading = false
  page = 1
  total = 0
  perPage = 15
  lastPage = 1

  ngOnInit(): void {
    if (!this.sessionGuard.checkSessionOrRedirect()) return
    this.loadLogs()
  }

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

        // VALIDAR: Asegurar que la página actual sea válida
        if (page > this.lastPage && this.lastPage > 0) {
          // Si la página solicitada es mayor a la última página válida,
          // cargar la última página válida
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

        // En caso de error, resetear a valores seguros
        this.page = 1
        this.logs = []
        this.total = 0
        this.lastPage = 1
      }
    })
  }

  navigateTo(path: string) {
    this.router.navigate([path])
  }

  changePage(newPage: number) {
    // MEJORAR: Validación más robusta
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

  // NUEVO: Método para ir a la primera página disponible
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

  // NUEVO: Método para refrescar los datos
  refresh() {
    this.loadLogs(this.page)
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'create': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      default: return '📝'
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'create': return 'text-green-400 bg-green-500/20'
      case 'update': return 'text-yellow-400 bg-yellow-500/20'
      case 'delete': return 'text-red-400 bg-red-500/20'
      default: return 'text-blue-400 bg-blue-500/20'
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  // GETTER: Para mostrar información de paginación en template
  get paginationInfo(): string {
    if (this.total === 0) return 'Sin registros'

    const start = ((this.page - 1) * this.perPage) + 1
    const end = Math.min(this.page * this.perPage, this.total)

    return `${start}-${end} de ${this.total} registros`
  }

  // GETTER: Para deshabilitar botones de paginación
  get canGoToPrevious(): boolean {
    return this.page > 1 && !this.loading
  }

  get canGoToNext(): boolean {
    return this.page < this.lastPage && !this.loading
  }
}
