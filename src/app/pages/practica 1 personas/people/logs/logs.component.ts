import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LogsService } from '../../../../services/logs.service'
import { LogEntry } from '../../../../models/log.model'
import { SidebarComponent } from '../../../../shared/components/layouts/sidebar/sidebar.component'
import { SessionGuardService } from '../../../../services/guards/session.guard.service'

interface LogsResponse {
  data: LogEntry[]
  total: number
  page: number
  perPage: number
  lastPage: number
}

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
      next: (response: any) => {
        if (response.data) {
          // Respuesta con paginación
          this.logs = response.data
          this.total = response.total
          this.page = response.page
          this.perPage = response.perPage
          this.lastPage = response.lastPage
        } else {
          // Respuesta simple (por compatibilidad)
          this.logs = response
        }
        this.loading = false
      },
      error: (err) => {
        console.error('Error loading logs:', err)
        this.loading = false
      }
    })
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.lastPage) {
      this.loadLogs(newPage)
    }
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
}
