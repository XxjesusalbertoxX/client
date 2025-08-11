import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-game-setup-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-setup-modal.component.html',
  styleUrls: ['./game-setup-modal.component.scss'],
})
export class GameSetupModalComponent {
  @Output() gameCreated = new EventEmitter<string[]>();
  @Output() cancelled = new EventEmitter<void>();

  colorCount = 6; // Valor por defecto
  selectedColors = signal<(string | null)[]>([null, null, null, null, null, null]);
  currentColorIndex = 0;

  onColorCountChange() {
    console.log('[onColorCountChange] Nuevo colorCount:', this.colorCount)
    // Ajustar el array de colores según la nueva cantidad
    const newColors = new Array(this.colorCount).fill(null);
    const currentColors = this.selectedColors();

    // Mantener los colores ya seleccionados
    for (let i = 0; i < Math.min(currentColors.length, newColors.length); i++) {
      newColors[i] = currentColors[i];
    }

    console.log('[onColorCountChange] Colores antes:', currentColors)
    console.log('[onColorCountChange] Colores después:', newColors)
    this.selectedColors.set(newColors);
  }

  openColorPicker(index: number) {
    this.currentColorIndex = index;
    console.log('[openColorPicker] Abriendo picker para índice:', index)
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
    if (colorInput) {
      // Si ya hay un color seleccionado, ponerlo como valor inicial
      const currentColor = this.selectedColors()[index];
      if (currentColor) {
        colorInput.value = currentColor;
      }
      colorInput.click();
    }
  }

  getSelectedColorsCount(): number {
    const count = this.selectedColors().filter((c: string | null) => c !== null).length;
    console.log('[getSelectedColorsCount] Total seleccionados:', count)
    return count;
  }
  
    onColorSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      const color = input.value;
  
      console.log('[onColorSelected] Color seleccionado:', color, 'en índice:', this.currentColorIndex)
      
      // NUEVA VALIDACIÓN: Verificar que el color no esté repetido
      const colors = [...this.selectedColors()];
      const colorAlreadyExists = colors.some((existingColor, index) => 
        existingColor === color && index !== this.currentColorIndex
      );
  
      if (colorAlreadyExists) {
        console.warn('[onColorSelected] Color ya existe en la paleta:', color)
        alert('Este color ya está seleccionado. Por favor elige un color diferente.');
        return;
      }
  
      colors[this.currentColorIndex] = color;
      this.selectedColors.set(colors);
      console.log('[onColorSelected] Estado actual de colores:', colors)
    }
  
    // NUEVO MÉTODO: Validar que todos los colores sean únicos
    allColorsUnique(): boolean {
      const colors = this.selectedColors().filter(c => c !== null);
      const uniqueColors = new Set(colors);
      const isUnique = uniqueColors.size === colors.length;
      console.log('[allColorsUnique] Colores únicos?', isUnique, 'Total:', colors.length, 'Únicos:', uniqueColors.size)
      return isUnique;
    }
  
    allColorsSelected(): boolean {
      const colors = this.selectedColors();
      const allSelected = colors.every(color => color !== null);
      const allUnique = this.allColorsUnique();
      const isValid = allSelected && allUnique;
      console.log('[allColorsSelected] Todos seleccionados?', allSelected, 'Únicos?', allUnique, 'Válido?', isValid)
      return isValid;
    }
  
    createGame() {
      if (this.allColorsSelected()) {
        const colors = this.selectedColors().filter(c => c !== null) as string[];
        console.log('[createGame] Colores a enviar:', colors, 'Cantidad:', colors.length);
        this.gameCreated.emit(colors);
      } else {
        console.warn('[createGame] No todos los colores están seleccionados o hay colores repetidos')
        alert('Asegúrate de seleccionar todos los colores y que sean diferentes entre sí.');
      }
    }
  
  // ...existing code...
  cancel() {
    console.log('[cancel] Cancelando configuración de juego')
    this.cancelled.emit();
  }
}
