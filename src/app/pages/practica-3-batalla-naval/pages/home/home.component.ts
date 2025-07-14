// src/app/pages/practica-3-battalla-naval/pages/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToBattleship() {
    this.router.navigateByUrl('games/battleship');
  }

  goToSimon() {
    alert('Simón Dice próximamente...');
  }
}

