import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-color-picker-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-color-picker-modal.component.html',
  styleUrls: ['./single-color-picker-modal.component.scss']
})
export class SingleColorPickerModalComponent {
  @Input() availableColors: string[] = [];
  @Input() title: string = 'Escoge un color';
  @Input() subtitle: string = 'Selecciona el color que tu oponente debe repetir';
  
  @Output() colorSelected = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  selectedColor: string | null = null;

  selectColor(color: string) {
    this.selectedColor = color;
  }

  trackByColor(index: number, color: string): string {
    return color;
  }

  confirmSelection() {
    if (this.selectedColor) {
      this.colorSelected.emit(this.selectedColor);
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  isSelected(color: string): boolean {
    return this.selectedColor === color;
  }

  canConfirm(): boolean {
    return !!this.selectedColor;
  }
}