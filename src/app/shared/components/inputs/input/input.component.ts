import { Component, forwardRef, Input, Signal, effect, WritableSignal } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = ''
  @Input() type = 'text'
  @Input() placeholder = ''

  /** Usar Signals si se desea */
  @Input() model?: WritableSignal<string | number | null>

  value = ''
  disabled = false

  onChange = (value: any) => {}
  onTouched = () => {}

  writeValue(value: any): void {
    this.value = value ?? ''
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement
    this.value = target.value
    this.onChange(this.value)
    console.log('[Input del usuario]', this.label, '→', this.value)

    // Actualizar Signal si se usa
    if (this.model) {
      this.model.set(this.value)
    }
  }

  onBlur() {
    this.onTouched()
  }

  syncModel = effect(() => {
    if (this.model) {
      const modelValue = this.model()
      if (modelValue !== this.value) {
        this.value = modelValue?.toString() ?? ''
        console.log('[Sync desde Signal]', this.label, '→', this.value)
      }
    }
  })

}
