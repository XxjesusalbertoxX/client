import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PeopleService } from '../../../../services/people.service'
import { SidebarComponent } from '../../../../shared/components/layouts/sidebar/sidebar.component'
import { SessionGuardService } from '../../../../services/guards/session.guard.service'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-people',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  private peopleService = inject(PeopleService)
  private sessionGuard = inject(SessionGuardService)
  private router = inject(Router)

  people: any[] = []
  total = 0
  page = 1
  pages = 1
  loading = false
  pageSize = 10 // Agregar constante para el tamaño de página

  ngOnInit(): void {
    if (!this.sessionGuard.checkSessionOrRedirect()) return
    this.loadPeople()
  }

  loadPeople(page: number = 1) {
    this.loading = true
    this.peopleService.getPeople(page).subscribe({
      next: (res) => {
        this.people = res.data
        this.total = res.total
        this.page = res.page
        this.pages = res.pages
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  changePage(p: number) {
    if (p < 1 || p > this.pages) return
    this.loadPeople(p)
  }

  goToCreate() {
    this.router.navigate(['/people/create'])
  }

  edit(person: any) {
    this.router.navigate(['/people', person.id, 'edit'],
      { state: { person } }
    )
  }

  deletingId: string | null = null

  delete(id: string) {
    if (!confirm('¿Seguro que quieres eliminar esta persona?')) return

    this.deletingId = id

    // Animación de eliminación
    setTimeout(() => {
      this.deletingId = null
    }, 300)

    this.peopleService.deletePerson(id).subscribe({
      next: () => {
        // Actualizar el total inmediatamente
        this.total = this.total - 1

        // Calcular nueva cantidad de páginas
        this.pages = Math.ceil(this.total / this.pageSize)

        // Si estamos en una página que ya no existe, ir a la última página válida
        if (this.page > this.pages && this.pages > 0) {
          this.page = this.pages
        }

        // Si no hay más datos, ir a la página 1
        if (this.total === 0) {
          this.page = 1
          this.pages = 1
          this.people = []
          return
        }

        // Verificar si necesitamos cambiar de página
        const currentPageItems = this.people.length
        const shouldReload = currentPageItems === 1 && this.page > 1

        if (shouldReload) {
          // Si eliminamos el último elemento de una página que no es la primera,
          // cargar la página anterior
          this.loadPeople(this.page - 1)
        } else {
          // Solo remover el elemento de la lista actual y recargar si es necesario
          this.people = this.people.filter(p => p.id !== id)

          // Si la página actual tiene menos elementos de los esperados, recargar
          if (this.people.length === 0 && this.total > 0) {
            this.loadPeople(this.page)
          }
        }
      },
      error: (error) => {
        console.error('Error al eliminar:', error)
        alert('Error al eliminar la persona')
        this.deletingId = null
      }
    })
  }

  // Método auxiliar para recalcular la paginación después de múltiples eliminaciones
  private recalculatePagination() {
    this.pages = Math.ceil(this.total / this.pageSize)

    if (this.page > this.pages && this.pages > 0) {
      this.page = this.pages
      this.loadPeople(this.page)
    } else if (this.total === 0) {
      this.page = 1
      this.pages = 1
      this.people = []
    }
  }
}
