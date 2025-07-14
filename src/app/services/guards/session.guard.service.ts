// session.guard.service.ts
import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../auth.service'
import { jwtDecode } from 'jwt-decode'

@Injectable({ providedIn: 'root' })
export class SessionGuardService {
  private auth = inject(AuthService)
  private router = inject(Router)

  checkSessionOrRedirect(): boolean {
    const token = this.auth.getAccessToken()
    if (!token) {
      this.forceLogout()
      return false
    }

    try {
      const decoded: any = jwtDecode(token)
      const now = Math.floor(Date.now() / 1000)
      if (!decoded.exp || decoded.exp < now) {
        this.forceLogout()
        return false
      }
      return true
    } catch {
      this.forceLogout()
      return false
    }
  }

  private forceLogout() {
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
