import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-picker-modal.component.html',
  styleUrls: ['./color-picker-modal.component.scss']
})
export class ColorPickerModalComponent {
  @Input() currentColors: string[] = [];
  @Output() colorsSelected = new EventEmitter<string[]>();
  @Output() cancelled = new EventEmitter<void>();

  // Paleta de colores predefinidos
  availableColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF8000', '#8000FF', '#00FF80', '#80FF00', '#FF0080', '#0080FF',
    '#FF4040', '#40FF40', '#4040FF', '#FFFF40', '#FF40FF', '#40FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#C0C0C0', '#808080', '#404040', '#FFFFFF', '#000000', '#FFC0CB'
  ];

  selectedColors: string[] = [];

  get placeholderSlots(): any[] {
    return Array(6 - this.selectedColors.length);
  }

  ngOnInit() {
    this.selectedColors = [...this.currentColors];
  }

  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    
    if (index > -1) {
      // Remover color
      this.selectedColors.splice(index, 1);
    } else if (this.selectedColors.length < 6) {
      // Agregar color (máximo 6)
      this.selectedColors.push(color);
    }
  }

  isSelected(color: string): boolean {
    return this.selectedColors.includes(color);
  }

  canConfirm(): boolean {
    return this.selectedColors.length === 6;
  }

  confirmSelection() {
    if (this.canConfirm()) {
      this.colorsSelected.emit([...this.selectedColors]);
    }
  }

  cancel() {
    this.cancelled.emit();
  }

  resetToDefault() {
    this.selectedColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  }

  trackByColor(index: number, color: string): string {
    return color;
  }
}