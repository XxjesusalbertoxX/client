import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoteriaService } from '../../../../services/gameservices/loteria.service';
import { GameJoinComponent } from '../../../../shared/components/forms/game-join/game-join.component';
import { LoteriaSettingsModalComponent, LoteriaSettings } from '../../components/loteria-settings-modal/loteria-settings-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-loteria-home',
  imports: [CommonModule, GameJoinComponent, LoteriaSettingsModalComponent],
  templateUrl: './loteria-home.component.html',
  styleUrls: ['./loteria-home.component.scss']
})
export class LoteriaHomeComponent {
  private router = inject(Router);
  private loteriaService = inject(LoteriaService);
  private toastr = inject(ToastrService);

  showJoin = false;
  showSettingsModal = false;
  isLoading = false;
  errorMessage = '';

  onCreateClick() {
    this.showSettingsModal = true;
  }

  onJoinClick() {
    this.showJoin = true;
  }

  onBackClick() {
    this.router.navigate(['/games']);
  }

  onCreateGame(settings: LoteriaSettings) {
    this.isLoading = true;
    this.showSettingsModal = false;

    this.loteriaService.createGame(settings).subscribe({
      next: (response) => {
        this.router.navigate(['games/loteria/lobby'], {
          queryParams: {
            id: response.gameId,
            code: response.code
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error.error?.message || 'Error al crear la partida');
      }
    });
  }

  onSubmitCode(code: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.loteriaService.joinGame({ code }).subscribe({
      next: (response) => {
        this.router.navigate(['/games/loteria/lobby'], {
          queryParams: { id: response.gameId }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al unirse a la partida';
        this.isLoading = false;
      }
    });
  }
}
