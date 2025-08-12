import { Component, computed, signal, WritableSignal, inject } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'       // <-- importa esto
import { PeopleService } from '../../../../services/people.service'
import { ButtonComponent } from '../../../../shared/components/commons/button/button.component'
import { InputComponent } from '../../../../shared/components/inputs/input/input.component'

@Component({
  selector: 'app-create-person',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, FormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
// ...existing code...

export class CreateComponent {
  private peopleService = inject(PeopleService)
  private router = inject(Router)

  // Signals
  firstName: WritableSignal<string> = signal('')
  lastName: WritableSignal<string> = signal('')
  age: WritableSignal<number | null> = signal(null)
  genre: WritableSignal<string> = signal('')

  submitting = signal(false)
  errorMsg = signal('')

  cancel(){
    this.router.navigate(['/people'])
  }

  // VALIDACIONES MEJORADAS
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
    return ['male', 'female'].includes(genre)
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

    console.log('payload',payload)

    this.peopleService.createPerson(payload).subscribe({
      next: () => {
        console.log('Persona creada exitosamente')
        this.router.navigate(['/people'])
      },
      error: (err) => {
        console.error('Error al crear persona:', err)
        this.errorMsg.set(err?.error?.message || 'Error al registrar')
        this.submitting.set(false)
      }
    })
  }
}