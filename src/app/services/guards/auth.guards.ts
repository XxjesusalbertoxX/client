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
    
    // 1. Verificar si hay tokens
    const accessToken = this.authService.getAccessToken()
    const refreshToken = this.authService.getRefreshToken()

    console.log(`[AuthGuard] Access token: ${accessToken ? 'presente' : 'ausente'}`)
    console.log(`[AuthGuard] Refresh token: ${refreshToken ? 'presente' : 'ausente'}`)

    // 2. Si no hay ningún token, redirigir al login
    if (!accessToken && !refreshToken) {
      console.warn('[AuthGuard] No hay tokens, redirigiendo al login')
      this.redirectToLogin()
      return false
    }

    // 3. Validar access token si existe
    if (accessToken && !this.isTokenValid(accessToken)) {
      console.warn('[AuthGuard] Access token inválido o expirado')
      localStorage.removeItem('accessToken')
      
      // Si no hay refresh token válido, logout
      if (!refreshToken || !this.isTokenValid(refreshToken)) {
        console.warn('[AuthGuard] Refresh token también inválido, redirigiendo al login')
        this.authService.logout()
        this.redirectToLogin()
        return false
      }
    }

    // 4. Validar refresh token si no hay access token válido
    if (!accessToken && refreshToken && !this.isTokenValid(refreshToken)) {
      console.warn('[AuthGuard] Refresh token inválido o expirado')
      this.authService.logout()
      this.redirectToLogin()
      return false
    }

    // 5. Si llegamos aquí, al menos tenemos un token válido
    console.log('[AuthGuard] Acceso permitido')
    return true
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)
      
      // Verificar que tenga expiración
      if (!decoded.exp || typeof decoded.exp !== 'number') {
        console.warn('[AuthGuard] Token sin fecha de expiración válida')
        return false
      }
      
      // Verificar que no esté expirado
      if (decoded.exp <= now) {
        console.warn('[AuthGuard] Token expirado')
        return false
      }
      
      // Verificar que tenga estructura correcta
      if (!decoded.id) {
        console.warn('[AuthGuard] Token sin ID de usuario')
        return false
      }
      
      return true
    } catch (error) {
      console.warn('[AuthGuard] Token corrupto:', error)
      return false
    }
  }

  private redirectToLogin() {
    this.router.navigate(['/login'])
  }
}