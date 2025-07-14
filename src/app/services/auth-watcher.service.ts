import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'
import { AuthService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class AuthWatcherService {
  private router = inject(Router)
  private authService = inject(AuthService)

  private timeoutId: any = null

  constructor() {
    this.scheduleTokenCheck()
  }

  private scheduleTokenCheck() {
    const accessToken = this.authService.getAccessToken()

    if (!accessToken) {
      this.tryRefreshOrLogout()
      return
    }

    try {
      const decoded: any = jwtDecode(accessToken)
      const now = Math.floor(Date.now() / 1000)

      if (!decoded.exp || typeof decoded.exp !== 'number') {
        this.forceLogout('[Watcher] Token sin expiración válida')
        return
      }

      const expiresIn = decoded.exp - now
      if (expiresIn <= 0) {
        this.tryRefreshOrLogout()
        return
      }

      // 🔁 Renueva el token 10 segundos antes de que expire
      const checkIn = (expiresIn - 10) * 1000

      this.timeoutId = setTimeout(() => this.tryRefreshOrLogout(), checkIn)

      console.log(`[Watcher] Token válido. Se revisará en ${checkIn / 1000}s`)
    } catch (e) {
      this.forceLogout('[Watcher] Token corrupto')
    }
  }

  private tryRefreshOrLogout() {
    const refreshToken = this.authService.getRefreshToken()
    if (refreshToken) {
      this.authService.refreshAccessToken().subscribe({
        next: () => {
          console.log('[Watcher] Access token renovado')
          this.scheduleTokenCheck()
        },
        error: () => this.forceLogout('[Watcher] Falló renovación de token')
      })
    } else {
      this.forceLogout('[Watcher] No hay refresh token')
    }
  }

  private forceLogout(msg: string) {
    console.warn(msg)
    clearTimeout(this.timeoutId)
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
