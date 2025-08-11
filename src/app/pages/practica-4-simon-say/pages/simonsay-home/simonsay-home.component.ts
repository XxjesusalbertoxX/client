import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SimonSayService } from '../../../../services/gameservices/simonsay.services';
import { GameHomeComponent } from '../../../../shared/components/forms/game-home/game-home.component';
import { GameSetupModalComponent } from '../../components/game-setup-modal/game-setup-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-simonsay-home',
  imports: [CommonModule, GameHomeComponent, GameSetupModalComponent],
  template: `
    <app-game-home 
      gameType="simon"
      (createGame)="showSetupModal()"
      (joinGame)="goToJoin()"
      (goBack)="goBack()">
    </app-game-home>

    <!-- Modal de configuración -->
    <app-game-setup-modal
      *ngIf="showModal()"
      (gameCreated)="onGameCreated($event)"
      (cancelled)="showModal.set(false)">
    </app-game-setup-modal>
  `
})
export class SimonsayHomeComponent {
  showModal = signal(false);

  constructor(
    private router: Router,
    private simonSayService: SimonSayService,
    private toastr: ToastrService
  ) {}

  showSetupModal() {
    this.showModal.set(true);
  }

  onGameCreated(colors: string[]) {
    console.log('Colors selected:', colors);
    
    // Crear el juego con los colores seleccionados
    this.simonSayService.createGameWithColors(colors).subscribe({
      next: (res) => {
        this.showModal.set(false);
        this.toastr.success('¡Partida creada con colores personalizados!');
        this.router.navigate(['games/simonsay/lobby'], {
          queryParams: { id: res.gameId, code: res.code },
        });
      },
      error: (err) => {
        console.error('Error creando partida', err);
        this.toastr.error('Error al crear la partida');
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