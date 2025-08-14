import { Injectable, inject } from '@angular/core'
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../auth.service'
import { jwtDecode } from 'jwt-decode'

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService)
  private router = inject(Router)

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log(`[AuthGuard] Validando acceso a: ${state.url}`)

    const accessToken = this.authService.getAccessToken()
    const refreshToken = this.authService.getRefreshToken()

    // Si hay access token válido (no expirado), permitir acceso
    if (accessToken) {
      console.log('[AuthGuard] Access token válido, acceso permitido')
      return true
    }

    // Si no hay access token válido pero hay refresh token
    if (refreshToken && this.isTokenValid(refreshToken)) {
      // Verificar si hay un access token expirado que pueda renovarse
      const rawAccessToken = this.authService.getAccessTokenRaw()

      if (rawAccessToken && this.isTokenStructureValid(rawAccessToken)) {
        console.log('[AuthGuard] Access token expirado pero renovable, permitiendo acceso')
        // El componente se encargará de renovar el tiempo
        return true
      }
    }

    // Si no hay tokens válidos o renovables, redirigir al login
    console.warn('[AuthGuard] No hay tokens válidos, redirigiendo al login')
    this.redirectToLogin()
    return false
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)

      if (!decoded.exp || typeof decoded.exp !== 'number') {
        return false
      }

      if (decoded.exp <= now) {
        return false
      }

      if (!decoded.id) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  private isTokenStructureValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token)
      return !!(decoded.id && decoded.exp)
    } catch (error) {
      return false
    }
  }

  private redirectToLogin() {
    this.router.navigate(['/login'])
  }
}
