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
    // Lleva a la ruta de creación de persona
    this.router.navigate(['/people/create'])
  }

  edit(person: any) {
    // Lleva a la ruta de edición, pasando el id
    this.router.navigate(['/people', person.id, 'edit'],
      { state: { person } }
    )
  }

  deletingId: string | null = null


  delete(id: string) {
    // Confirmación simple antes de borrar
    if (!confirm('¿Seguro que quieres eliminar esta persona?')) return

    this.deletingId = id

    setTimeout(() => {
      // Quita con animación después de 300ms
      this.people = this.people.filter(p => p.id !== id)
      this.deletingId = null
    }, 300)

    this.peopleService.deletePerson(id).subscribe({
      next: () => {
        // Filtra la persona eliminada sin recargar la tabla completa
      this.people = this.people.filter(p => p.id !== id)
      },
      error: () => alert('Error al eliminar')
    })
  }

}
