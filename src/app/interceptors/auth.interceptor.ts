import { inject } from '@angular/core'
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http'
import { catchError, switchMap, finalize } from 'rxjs/operators'
import { throwError, of, BehaviorSubject } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const token = auth.getAccessToken()

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req

  let isRefreshing = false
  let refreshTokenSubject = new BehaviorSubject<string | null>(null)

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const refreshToken = auth.getRefreshToken()
        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true
            refreshTokenSubject.next(null)

            return auth.refreshAccessToken().pipe(
              switchMap((newToken: string) => {
                isRefreshing = false
                refreshTokenSubject.next(newToken)
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                return next(retryReq)
              }),
              catchError(() => {
                isRefreshing = false
                auth.logout()
                router.navigate(['/login'])
                return throwError(() => err)
              }),
            )
          } else {
            // Si ya se está refrescando, espera a que termine y usa el token nuevo
            return refreshTokenSubject.pipe(
              switchMap((newToken) => {
                if (newToken) {
                  const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
                  return next(retryReq)
                }
                auth.logout()
                router.navigate(['/login'])
                return throwError(() => err)
              }),
            )
          }
        } else {
          auth.logout()
          router.navigate(['/login'])
          return throwError(() => err)
        }
      }
      return throwError(() => err)
    }),
  )
}
