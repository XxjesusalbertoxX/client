import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'
import { provideHttpClient } from '@angular/common/http'
import { provideAnimations } from '@angular/platform-browser/animations'
import { inject } from '@angular/core'
import { AuthWatcherService } from './app/services/auth-watcher.service'
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    ...appConfig.providers,
    provideAnimations(),
    {
      provide: 'AppInit',
      useFactory: () => {
        inject(AuthWatcherService)
        return true
      }
    }
  ]
})
