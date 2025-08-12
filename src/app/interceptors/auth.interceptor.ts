import { inject } from '@angular/core'
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http'
import { catchError, switchMap } from 'rxjs/operators'
import { throwError, BehaviorSubject } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const token = auth.getAccessToken()

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req

  let isRefreshing = false
  let refreshTokenSubject = new BehaviorSubject<string | null>(null)

  // NUEVA FUNCIÓN: Validar si el refresh token es válido
  const isRefreshTokenValid = (refreshToken: string): boolean => {
    try {
      const decoded: any = jwtDecode(refreshToken)
      const now = Math.floor(Date.now() / 1000)
      
      // Verificar que tenga fecha de expiración y no esté expirado
      if (!decoded.exp || typeof decoded.exp !== 'number') {
        console.warn('[Interceptor] Refresh token sin expiración válida')
        return false
      }
      
      if (decoded.exp <= now) {
        console.warn('[Interceptor] Refresh token expirado')
        return false
      }
      
      // Verificar que tenga la estructura correcta (id de usuario)
      if (!decoded.id) {
        console.warn('[Interceptor] Refresh token sin ID de usuario')
        return false
      }
      
      return true
    } catch (error) {
      console.warn('[Interceptor] Refresh token corrupto:', error)
      return false
    }
  }

  const forceLogout = (reason: string) => {
    console.warn(`[Interceptor] Logout forzado: ${reason}`)
    isRefreshing = false
    auth.logout()
    router.navigate(['/login'])
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const refreshToken = auth.getRefreshToken()
        
        // VALIDAR: Si no hay refresh token, logout inmediato
        if (!refreshToken) {
          forceLogout('No hay refresh token')
          return throwError(() => err)
        }
        
        // VALIDAR: Si el refresh token no es válido, logout inmediato
        if (!isRefreshTokenValid(refreshToken)) {
          forceLogout('Refresh token inválido o expirado')
          return throwError(() => err)
        }

        if (!isRefreshing) {
          isRefreshing = true
          refreshTokenSubject.next(null)

          console.log('[Interceptor] Intentando renovar access token...')

          return auth.refreshAccessToken().pipe(
            switchMap((newToken: string) => {
              console.log('[Interceptor] Access token renovado exitosamente')
              isRefreshing = false
              refreshTokenSubject.next(newToken)
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              return next(retryReq)
            }),
            catchError((refreshError) => {
              console.error('[Interceptor] Falló la renovación del token:', refreshError)
              forceLogout('Falló renovación del token')
              return throwError(() => err)
            })
          )
        } else {
          // Si ya se está refrescando, espera a que termine
          return refreshTokenSubject.pipe(
            switchMap((newToken) => {
              if (newToken) {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                return next(retryReq)
              }
              forceLogout('No se pudo obtener nuevo token')
              return throwError(() => err)
            })
          )
        }
      }
      return throwError(() => err)
    })
  )
}