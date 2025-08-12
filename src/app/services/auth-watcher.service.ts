import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'
import { AuthService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class AuthWatcherService {
  private router = inject(Router)
  private authService = inject(AuthService)
  private timeoutId: any = null
  private isWatcherRefreshing = false // Flag para evitar múltiples refreshs

  constructor() {
    this.scheduleTokenCheck()
  }

  private scheduleTokenCheck() {
    const accessToken = this.authService.getAccessToken()

    if (!accessToken) {
      if (this.authService.getRefreshToken()) {
        console.log('[Watcher] No hay access token pero hay refresh token')
        // No intentar refresh aquí, dejar que el interceptor lo maneje
        this.scheduleNextCheck(30000) // Revisar en 30 segundos
      } else {
        this.forceLogout('[Watcher] No hay tokens válidos')
      }
      return
    }

    try {
      const decoded: any = jwtDecode(accessToken)
      const now = Math.floor(Date.now() / 1000)

      if (!decoded.exp || typeof decoded.exp !== 'number') {
        this.forceLogout('[Watcher] Access token sin expiración válida')
        return
      }

      const expiresIn = decoded.exp - now
      if (expiresIn <= 0) {
        console.log('[Watcher] Access token expirado')
        if (this.authService.getRefreshToken()) {
          // Token expirado pero hay refresh, dejar que el interceptor maneje el refresh
          this.scheduleNextCheck(5000) // Revisar en 5 segundos
        } else {
          this.forceLogout('[Watcher] Token expirado y no hay refresh token')
        }
        return
      }

      // Programar próxima verificación 30 segundos antes de expirar
      const checkIn = Math.max(5000, (expiresIn - 30) * 1000)
      this.scheduleNextCheck(checkIn)

      console.log(`[Watcher] Token válido. Expira en ${expiresIn}s, se revisará en ${checkIn / 1000}s`)
    } catch (e) {
      this.forceLogout('[Watcher] Access token corrupto')
    }
  }

  private scheduleNextCheck(milliseconds: number) {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => this.scheduleTokenCheck(), milliseconds)
  }

  private forceLogout(msg: string) {
    console.warn(msg)
    clearTimeout(this.timeoutId)
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}