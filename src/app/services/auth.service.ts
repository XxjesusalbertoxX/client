import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, map, throwError, of } from 'rxjs'
import { environment } from '../../../environment/environment.prod';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Autentica un usuario con email y contraseña
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable con tokens de acceso y refresh
   */
  login(email: string, password: string): Observable<{ accessToken: string, refreshToken: string }> {
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.baseUrl}/login`, { email, password }
    )
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param data - Datos del usuario a registrar
   * @returns Observable con la respuesta del servidor
   */
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data)
  }

  /**
   * Cierra la sesión del usuario eliminando los tokens almacenados
   */
  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario tiene tokens válidos
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (accessToken) return true

    if (refreshToken) return true

    return false
  }

  /**
   * Obtiene el token de acceso solo si es válido y no expirado
   */
  getAccessToken(): string | null {
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)

      if (!decoded.exp || decoded.exp <= now) {
        console.warn('[AuthService] Access token expirado')
        return null // No remover, puede ser renovado
      }

      return token
    } catch {
      console.warn('[AuthService] Access token corrupto, removiendo...')
      localStorage.removeItem('accessToken')
      return null
    }
  }

  /**
   * Obtiene el token de acceso (sin validar expiración para permitir renovación de tiempo)
   */
  getAccessTokenRaw(): string | null {
    return localStorage.getItem('accessToken')
  }

  /**
   * Obtiene el token de refresh si es válido
   * @returns Token de refresh o null si no existe o está expirado
   */
  getRefreshToken(): string | null {
    const token = localStorage.getItem('refreshToken')
    if (!token) return null

    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)

      if (!decoded.exp || decoded.exp <= now) {
        console.warn('[AuthService] Refresh token expirado, removiendo...')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('accessToken')
        return null
      }

      return token
    } catch {
      console.warn('[AuthService] Refresh token corrupto, removiendo...')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessToken')
      return null
    }
  }

  /**
   * Valida si el refresh token es válido
   * @returns true si el refresh token existe y es válido
   */
  isRefreshTokenValid(): boolean {
    const refreshToken = this.getRefreshToken()
    return !!refreshToken
  }

  /**
   * Verifica el token de acceso en el servidor
   * @returns Observable con la respuesta de verificación
   */
  verifyToken() {
    const token = this.getAccessToken()
    return this.http.get(`${this.baseUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  /**
   * Obtiene los datos del usuario autenticado
   * @returns Observable con la información del usuario
   */
  getUser(): Observable<any> {
    const token = this.getAccessToken()
    return this.http.get(`${this.baseUrl}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

/**
   * NUEVA LÓGICA: Solo renueva el tiempo del access token si es válido estructuralmente
   * @returns Observable con el nuevo token de acceso
   */
  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken()
    const accessToken = localStorage.getItem('accessToken') // Token actual (puede estar expirado)

    if (!refreshToken) {
      console.error('[AuthService] No hay refresh token válido para renovar')
      return throwError(() => new Error('No refresh token available'))
    }

    if (!accessToken) {
      console.error('[AuthService] No hay access token para renovar el tiempo')
      return throwError(() => new Error('No access token to refresh time'))
    }

    // Verificar estructura del access token (sin importar si está expirado)
    try {
      const decoded: any = jwtDecode(accessToken)
      if (!decoded.id) {
        console.error('[AuthService] Access token sin estructura válida')
        this.logout()
        return throwError(() => new Error('Invalid access token structure'))
      }
    } catch (error) {
      console.error('[AuthService] Access token corrupto:', error)
      this.logout()
      return throwError(() => new Error('Corrupted access token'))
    }

    console.log('[AuthService] Renovando tiempo del access token...')

    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/auth/refresh`, {
      refreshToken,
      accessToken // Enviar también el access token actual
    }).pipe(
      map(res => {
        const newAccess = res.accessToken
        localStorage.setItem('accessToken', newAccess)
        console.log('[AuthService] Tiempo del access token renovado exitosamente')
        return newAccess
      }),
      catchError((error) => {
        console.error('[AuthService] Error renovando tiempo del token:', error)

        if (error.status === 401) {
          console.warn('[AuthService] Tokens inválidos o expirados, requiere login')
          this.logout()
        }

        return throwError(() => error)
      })
    )
  }

  /**
   * Guarda los tokens en localStorage
   * @param access - Token de acceso
   * @param refresh - Token de refresh
   */
  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  /**
   * Verifica si un email ya existe en el sistema
   * @param email - Email a verificar
   * @returns Observable con boolean indicando si existe
   */
  checkEmail(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`/api/check-email/${email}`).pipe(
      map(response => response.exists)
    )
  }

  /**
   * Obtiene el ID del usuario desde el token de acceso
   * @returns ID del usuario o null si no está disponible
   */
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

  /**
   * ACTUALIZADA: Validación mejorada que distingue entre token expirado vs inválido
   */
  async validateTokensOnComponent(): Promise<boolean> {
    console.log('[AuthService] Validando tokens en componente')

    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = this.getRefreshToken()

    // Si no hay ningún token
    if (!accessToken && !refreshToken) {
      console.warn('[AuthService] No hay tokens, requiere login')
      this.logout()
      return false
    }

    // Si hay access token, verificar su estructura y estado
    if (accessToken) {
      try {
        const decoded: any = jwtDecode(accessToken)
        const now = Math.floor(Date.now() / 1000)

        // Verificar estructura
        if (!decoded.id || !decoded.exp) {
          console.warn('[AuthService] Access token con estructura inválida')
          localStorage.removeItem('accessToken')
        }
        // Si está expirado pero estructuralmente válido, intentar renovar
        else if (decoded.exp <= now) {
          console.log('[AuthService] Access token expirado, intentando renovar tiempo...')

          if (refreshToken) {
            try {
              await this.refreshAccessToken().toPromise()
              console.log('[AuthService] Tiempo del token renovado exitosamente')
              return true
            } catch (error) {
              console.warn('[AuthService] No se pudo renovar el tiempo del token')
              this.logout()
              return false
            }
          } else {
            console.warn('[AuthService] No hay refresh token para renovar')
            this.logout()
            return false
          }
        }
        // Si no está expirado, verificar con servidor
        else {
          try {
            const isValid = await this.verifyTokenWithServer(accessToken).toPromise()
            if (isValid) {
              console.log('[AuthService] Access token válido')
              return true
            }
          } catch (error) {
            console.warn('[AuthService] Token rechazado por servidor')
            this.logout()
            return false
          }
        }
      } catch (error) {
        console.warn('[AuthService] Access token corrupto:', error)
        localStorage.removeItem('accessToken')
      }
    }

    // Si llegamos aquí sin access token válido, verificar refresh
    if (refreshToken) {
      if (!this.isTokenValid(refreshToken)) {
        console.warn('[AuthService] Refresh token inválido')
        this.logout()
        return false
      }

      // No intentar crear nuevo access token, requiere login
      console.warn('[AuthService] No hay access token válido y refresh solo renueva tiempo')
      this.logout()
      return false
    }

    this.logout()
    return false
  }


  /**
   * Verifica un token específico con el servidor
   * @param token - Token a verificar
   * @returns Observable<boolean> - true si el token es válido
   */
  private verifyTokenWithServer(token: string): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map((response: any) => {
        return response.valid === true
      }),
      catchError((error) => {
        console.warn('[AuthService] Token inválido en servidor:', error)
        return of(false)
      })
    )
  }

  // ...existing code...
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
}
