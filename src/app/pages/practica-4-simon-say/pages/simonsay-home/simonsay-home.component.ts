import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';

@Component({
  standalone: true,
  selector: 'app-simonsay-home',
  imports: [CommonModule],
  templateUrl: './simonsay-home.component.html',
  styleUrls: ['./simonsay-home.component.scss'],
})
export class SimonsayHomeComponent {
  constructor(
    private router: Router,
    private simonSayService: SimonSayService
  ) {}

  goToCreate() {
    this.simonSayService.createGame().subscribe({
      next: (res) => {
        this.router.navigate(['games/simonsay/lobby'], {
          queryParams: { id: res.gameId, code: res.code },
        });
      },
      error: (err) => {
        console.error('Error creando partida', err);
      },
    });
  }

  goToJoin() {
    this.router.navigateByUrl('games/simonsay/join');
  }

  goBack() {
    this.router.navigate(['/games']);
  }
}