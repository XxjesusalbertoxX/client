import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface JoinConfig {
  title: string;
  emoji: string;
  backgroundGradient: string;
  buttonGradient: string;
}

@Component({
  standalone: true,
  selector: 'app-game-join',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './game-join.component.html',
  styleUrls: ['./game-join.component.scss']
})
export class GameJoinComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() gameType: 'battleship' | 'simon' | 'loteria' = 'battleship';
  @Input() isLoading = false;
  @Input() errorMessage = '';

  @Output() submitCode = new EventEmitter<string>();
  @Output() goBack = new EventEmitter<void>();

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
  });

  ngOnInit() {
    this.form.reset();
  }

  get config(): JoinConfig {
    const configs: Record<string, JoinConfig> = {
      battleship: {
        title: 'Batalla Naval',
        emoji: '⚓',
        backgroundGradient: 'from-slate-900 via-blue-900 to-slate-900',
        buttonGradient: 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      },
      simon: {
        title: 'Simon Dice',
        emoji: '🎨',
        backgroundGradient: 'from-slate-900 via-purple-900 to-slate-900',
        buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      },
      loteria: {
        title: 'Lotería Mexicana',
        emoji: '🎲',
        backgroundGradient: 'from-red-900 via-orange-900 to-yellow-900',
        buttonGradient: 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
      }
    };
    return configs[this.gameType];
  }

  onSubmit() {
    if (this.form.valid && !this.isLoading) {
      const code = this.form.value.code!.toUpperCase();
      this.submitCode.emit(code);
    }
  }

  onBackClick() {
    this.goBack.emit();
  }
}