//main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'
import { provideHttpClient } from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations'
import { inject } from '@angular/core'
import { AuthWatcherService } from './app/services/auth-watcher.service'

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...appConfig.providers,
    provideAnimations(),
    {
      provide: 'AppInit',
      useFactory: () => {
        inject(AuthWatcherService) // activa el watcher
        return true
      }
    }
  ]
})
