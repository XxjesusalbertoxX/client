// src/app/interceptors/auth.interceptor.ts
import { inject } from '@angular/core'
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http'
import { catchError, switchMap } from 'rxjs/operators'
import { throwError, of } from 'rxjs'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService)
  const router = inject(Router)
  const token = auth.getAccessToken()

  // Clona la request con el accessToken si existe
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const refreshToken = auth.getRefreshToken()
        if (refreshToken) {
          // Intenta renovar token y reintentar la request
          return auth.refreshAccessToken().pipe(
            switchMap(newToken => {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              })
              return next(retryReq)
            }),
            catchError(() => {
              auth.logout()
              router.navigate(['/login'])
              return throwError(() => err)
            })
          )
        } else {
          auth.logout()
          router.navigate(['/login'])
        }
      }

      return throwError(() => err)
    })
  )
}
