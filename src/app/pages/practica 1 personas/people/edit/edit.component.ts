import { Component, computed, signal, WritableSignal, inject, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PeopleService } from '../../../../services/people.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InputComponent } from '../../../../shared/components/input/input.component'
import { ButtonComponent } from '../../../../shared/components/button/button.component'

@Component({
  selector: 'app-edit-person',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private peopleService = inject(PeopleService)

  personId = this.route.snapshot.paramMap.get('id')

  firstName: WritableSignal<string> = signal('')
  lastName: WritableSignal<string> = signal('')
  age: WritableSignal<number | null> = signal(null)
  genre: WritableSignal<string> = signal('')
  submitting = signal(false)
  errorMsg = signal('')

  isValid = computed(() =>
    this.firstName().trim().length >= 2 &&
    this.lastName().trim().length >= 2 &&
    this.age() !== null && this.age()! >= 1 &&
    this.genre().length > 0
  )

  ngOnInit(): void {
    const navState = this.router.getCurrentNavigation()?.extras.state as { person?: any }

    if (navState?.person) {
      // ✅ Si viene del listado
      this.setForm(navState.person)
    } else if (this.personId) {
      // 🔁 Si recarga la página o entra directo
      this.peopleService.getPersonById(this.personId).subscribe({
        next: (person) => this.setForm(person),
        error: () => this.errorMsg.set('No se pudo cargar la persona')
      })
    }
  }

  setForm(person: any) {
    this.firstName.set(person.firstName)
    this.lastName.set(person.lastName)
    this.age.set(person.age)
    this.genre.set(person.genre)
  }

  submit() {
    if (!this.isValid() || !this.personId) return

    this.submitting.set(true)
    this.errorMsg.set('')

    const payload = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      age: this.age(),
      genre: this.genre()
    }

    this.peopleService.updatePerson(this.personId, payload).subscribe({
      next: () => this.router.navigate(['/people']),
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Error al actualizar')
        this.submitting.set(false)
      }
    })
  }
}
