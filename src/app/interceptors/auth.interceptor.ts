import { inject } from '@angular/core'
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http'
import { catchError, switchMap, finalize } from 'rxjs/operators'
import { throwError, BehaviorSubject, of } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'
import { jwtDecode } from 'jwt-decode'

// Variables globales para manejar el estado de refresh
let isRefreshing = false
let refreshTokenSubject = new BehaviorSubject<string | null>(null)

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  // IMPORTANTE: No interceptar el endpoint de refresh para evitar bucles
  if (req.url.includes('/auth/refresh')) {
    return next(req)
  }

  const token = auth.getAccessToken()
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req

  const forceLogout = (reason: string) => {
    console.warn(`[Interceptor] Logout forzado: ${reason}`)
    isRefreshing = false
    refreshTokenSubject.next(null)
    auth.logout()
    router.navigate(['/login'])
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const refreshToken = auth.getRefreshToken()
        
        // Si no hay refresh token, logout inmediato
        if (!refreshToken) {
          forceLogout('No hay refresh token')
          return throwError(() => err)
        }

        // Si ya estamos en proceso de refresh, esperar
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            switchMap((newToken) => {
              if (newToken) {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                return next(retryReq)
              }
              return throwError(() => err)
            })
          )
        }

        // Iniciar proceso de refresh
        isRefreshing = true
        refreshTokenSubject.next(null)

        console.log('[Interceptor] Intentando renovar access token...')

        return auth.refreshAccessToken().pipe(
          switchMap((newToken: string) => {
            console.log('[Interceptor] Access token renovado exitosamente')
            refreshTokenSubject.next(newToken)
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            return next(retryReq)
          }),
          catchError((refreshError) => {
            console.error('[Interceptor] Falló la renovación del token:', refreshError)
            forceLogout('Refresh token inválido o expirado')
            return throwError(() => refreshError)
          }),
          finalize(() => {
            isRefreshing = false
          })
        )
      }
      
      return throwError(() => err)
    })
  )
}