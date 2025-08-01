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

  // Validación general
  isValid = computed(() => {
    return (
      this.firstName().trim().length >= 2 &&
      this.lastName().trim().length >= 2 &&
      this.age() !== null && this.age()! >= 1 &&
      this.genre().length > 0
    )
  })

  submit() {
    try {
      if (!this.isValid()) return

      this.submitting.set(true)
      this.errorMsg.set('')

      const payload = {
        firstName: this.firstName(),
        lastName: this.lastName(),
        age: this.age(),
        genre: this.genre()
      }

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
    } catch (error) {
      console.error('Error inesperado en submit:', error)
    }
  }

}
