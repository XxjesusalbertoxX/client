import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, map } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3333'

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
    return localStorage.getItem('accessToken')
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
}
