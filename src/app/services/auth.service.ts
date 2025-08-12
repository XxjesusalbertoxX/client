import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, map, throwError } from 'rxjs'
import { environment } from '../../../environment/environment.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private baseUrl = 'http://localhost:3333'
  // private baseUrl = 'http://192.168.1.30:3333'
  // private readonly baseUrl = 'http://www.atenasoficial.com:3333'
  private readonly baseUrl = environment.apiUrl; // Uncomment if using environment variable

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ accessToken: string, refreshToken: string }> {
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.baseUrl}/login`, { email, password }
    )
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data)
  }

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    // Si tienes access token válido, estás autenticado
    if (accessToken) return true

    // Si no tienes access token pero tienes refresh token válido, también estás autenticado
    // (el interceptor se encargará de renovar automáticamente)
    if (refreshToken) return true

    return false
  }

    // validateCurrentUser(): Observable<any> {
    //   return this.http.get<any>(`${this.baseUrl}/auth/me`).pipe(
    //     catchError((error) => {
    //       console.error('[AuthService] Error validando usuario actual:', error)

    //       // Si es 401, limpiar tokens
    //       if (error.status === 401) {
    //         this.logout()
    //       }

    //       return throwError(() => error)
    //     })
    //   )
    // }


  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)

      // Si el token está expirado, no lo devuelvas
      if (!decoded.exp || decoded.exp <= now) {
        console.warn('[AuthService] Access token expirado, removiendo...')
        localStorage.removeItem('accessToken')
        return null
      }

      return token
    } catch {
      console.warn('[AuthService] Access token corrupto, removiendo...')
      localStorage.removeItem('accessToken')
      return null
    }
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem('refreshToken')
    if (!token) return null

    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)

      // Si el refresh token está expirado, no lo devuelvas
      if (!decoded.exp || decoded.exp <= now) {
        console.warn('[AuthService] Refresh token expirado, removiendo...')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('accessToken') // También remover access token
        return null
      }

      return token
    } catch {
      console.warn('[AuthService] Refresh token corrupto, removiendo...')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessToken') // También remover access token
      return null
    }
  }

  // NUEVO: Método para validar si el refresh token es válido
  isRefreshTokenValid(): boolean {
    const refreshToken = this.getRefreshToken()
    return !!refreshToken // getRefreshToken ya valida internamente
  }

  verifyToken() {
    const token = this.getAccessToken()
    return this.http.get(`${this.baseUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  getUser(): Observable<any> {
    const token = this.getAccessToken()
    return this.http.get(`${this.baseUrl}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

    // ...existing code...

    refreshAccessToken(): Observable<string> {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        console.error('[AuthService] No hay refresh token válido para renovar')
        return throwError(() => new Error('No refresh token available'))
      }

      console.log('[AuthService] Enviando refresh token al servidor...')

      return this.http.post<{ accessToken: string }>(`${this.baseUrl}/auth/refresh`, {
        refreshToken
      }).pipe(
        map(res => {
          const newAccess = res.accessToken
          localStorage.setItem('accessToken', newAccess)
          console.log('[AuthService] Nuevo access token guardado')
          return newAccess
        }),
        catchError((error) => {
          console.error('[AuthService] Error en refreshAccessToken:', error)

          // Si el refresh falla, limpiar tokens
          if (error.status === 401 || error.status === 403) {
            console.warn('[AuthService] Refresh token inválido, limpiando tokens')
            this.logout() // Esto limpia localStorage
          }

          return throwError(() => error)
        })
      )
    }

  // ...existing code...

  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`/api/check-email/${email}`).pipe(
      map(response => response.exists)
    )
  }

  getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload: any = jwtDecode(token);
      return payload.id || payload.userId || null;
    } catch {
      return null;
    }
  }
}
