import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode';
import { Observable, map } from 'rxjs'
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
    return !!localStorage.getItem('accessToken')
  }

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
    return localStorage.getItem('refreshToken')
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

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available')

    return this.http.post<{ accessToken: string }>(`${this.baseUrl}/auth/refresh`, {
      refreshToken
    }).pipe(
      map(res => {
        const newAccess = res.accessToken
        localStorage.setItem('accessToken', newAccess)
        return newAccess
      })
    )
  }


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
