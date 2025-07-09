// app.component.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthWatcherService } from './services/auth-watcher.service'; // <-- importa el watcher

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
// El watcher se activa al inyectar el servicio
// regresa al login en caso de modificar el token
export class AppComponent {
  private authWatcher = inject(AuthWatcherService)
}
