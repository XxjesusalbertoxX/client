import { Component, computed, signal, WritableSignal, inject, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { PeopleService } from '../../../../services/people.service'
import { ButtonComponent } from '../../../../shared/components/commons/button/button.component'
import { InputComponent } from '../../../../shared/components/inputs/input/input.component'
import { AuthService } from '../../../../services/auth.service'

@Component({
  selector: 'app-edit-person',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, FormsModule, RouterModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  private peopleService = inject(PeopleService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)

  // Signals
  firstName: WritableSignal<string> = signal('')
  lastName: WritableSignal<string> = signal('')
  age: WritableSignal<number | null> = signal(null)
  genre: WritableSignal<string> = signal('')

  submitting = signal(false)
  errorMsg = signal('')
  loading = signal(false)
  personId: number = 0

  async ngOnInit() {
    const id = this.route.snapshot.params['id']
    this.personId = parseInt(id)
    this.loadPerson()

    const isValid = await this.authService.validateTokensOnComponent()
    if (!isValid) {
      this.router.navigate(['/login'])
      return
    }
  }

  loadPerson() {
    this.loading.set(true)
    this.peopleService.getPersonById(this.personId.toString()).subscribe({
      next: (person) => {
        this.firstName.set(person.firstName || '')
        this.lastName.set(person.lastName || '')
        this.age.set(person.age || null)
        this.genre.set(person.genre || '')
        this.loading.set(false)
      },
      error: (err) => {
        console.error('Error loading person:', err)
        this.errorMsg.set('Error al cargar los datos de la persona')
        this.loading.set(false)
      }
    })
  }

  // VALIDACIONES IGUALES AL CREATE
  firstNameValid = computed(() => {
    const name = this.firstName().trim()
    return name.length >= 2 && name.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)
  })

  lastNameValid = computed(() => {
    const lastName = this.lastName().trim()
    return lastName.length >= 2 && lastName.length <= 50 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)
  })

  ageValid = computed(() => {
    const age = this.age()
    return age !== null && age >= 4 && age <= 105
  })

  genreValid = computed(() => {
    const genre = this.genre()
    return ['male', 'female'].includes(genre) // SIN 'other' como en create
  })

  // Validación general
  isValid = computed(() => {
    return this.firstNameValid() && this.lastNameValid() && this.ageValid() && this.genreValid()
  })

  // Mensajes de error específicos
  getFirstNameError = computed(() => {
    const name = this.firstName().trim()
    if (name.length === 0) return ''
    if (name.length < 2) return 'Mínimo 2 caracteres'
    if (name.length > 50) return 'Máximo 50 caracteres'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return 'Solo letras y espacios'
    return ''
  })

  getLastNameError = computed(() => {
    const lastName = this.lastName().trim()
    if (lastName.length === 0) return ''
    if (lastName.length < 2) return 'Mínimo 2 caracteres'
    if (lastName.length > 50) return 'Máximo 50 caracteres'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) return 'Solo letras y espacios'
    return ''
  })

  getAgeError = computed(() => {
    const age = this.age()
    if (age === null) return ''
    if (age < 4) return 'Edad mínima: 4 años'
    if (age > 105) return 'Edad máxima: 105 años'
    return ''
  })

  submit() {
    if (!this.isValid()) return

    this.submitting.set(true)
    this.errorMsg.set('')

    const payload = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      age: Number(this.age()),
      genre: this.genre()
    }

    console.log('Edit payload:', payload)

    this.peopleService.updatePerson(this.personId.toString(), payload).subscribe({
      next: () => {
        console.log('Persona actualizada exitosamente')
        this.router.navigate(['/people'])
      },
      error: (err) => {
        console.error('Error al actualizar persona:', err)
        this.errorMsg.set(err?.error?.message || 'Error al actualizar')
        this.submitting.set(false)
      }
    })
  }
}
