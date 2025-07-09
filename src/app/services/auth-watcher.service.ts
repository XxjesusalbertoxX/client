import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'
import { AuthService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class AuthWatcherService {
  private router = inject(Router)
  private authService = inject(AuthService)

  constructor() {
    this.watchToken()
  }

  private watchToken() {
    setInterval(() => {
      const accessToken = this.authService.getAccessToken()

      if (!accessToken) {
        const refreshToken = this.authService.getRefreshToken()
        if (refreshToken) {
          this.authService.refreshAccessToken().subscribe({
            next: () => console.log('[Watcher] Access token renovado'),
            error: () => this.forceLogout('[Watcher] No se pudo renovar access token'),
          })
        } else {
          this.forceLogout('[Watcher] No hay tokens. Cerrando sesión.')
        }
        return
      }

      try {
        const decoded: any = jwtDecode(accessToken)
        const now = Math.floor(Date.now() / 1000)

        if (!decoded || typeof decoded.exp !== 'number') {
          this.forceLogout('[Watcher] Access token sin expiración válida.')
          return
        }

        if (decoded.exp < now) {
          const refreshToken = this.authService.getRefreshToken()
          if (refreshToken) {
            this.authService.refreshAccessToken().subscribe({
              next: () => console.log('[Watcher] Access token renovado'),
              error: () => this.forceLogout('[Watcher] Falló renovación'),
            })
          } else {
            this.forceLogout('[Watcher] Token expirado sin refresh.')
          }
          return
        }

        // 🔒 Verifica con backend que el token no haya sido alterado
        this.authService.verifyToken().subscribe({
          next: () => {}, // Token válido, todo bien
          error: () => {
            this.forceLogout('[Watcher] Token inválido según backend.')
          }
        })

      } catch (e) {
        this.forceLogout('[Watcher] Token corrupto.')
      }
    }, 5000)
  }

  private forceLogout(msg: string) {
    console.warn(msg)
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
