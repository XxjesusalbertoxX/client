import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

export interface LoteriaSettings {
  minPlayers: number;
  maxPlayers: number;
  drawCooldownSeconds: number;
}

@Component({
  standalone: true,
  selector: 'app-loteria-settings-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loteria-settings-modal.component.html',
  styleUrls: ['./loteria-settings-modal.component.scss']
})
export class LoteriaSettingsModalComponent {
  @Output() createGame = new EventEmitter<LoteriaSettings>();
  @Output() cancel = new EventEmitter<void>();
  private fb = inject(FormBuilder);

  settingsForm = this.fb.group({
    minPlayers: [4, [Validators.required, Validators.min(4), Validators.max(16)]],
    maxPlayers: [8, [Validators.required, Validators.min(4), Validators.max(16)]],
    drawCooldownSeconds: [3, [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  onSubmit() {
    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value as LoteriaSettings;
      
      // Validar que max >= min
      if (settings.maxPlayers < settings.minPlayers) {
        settings.maxPlayers = settings.minPlayers;
      }
      
      this.createGame.emit(settings);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}