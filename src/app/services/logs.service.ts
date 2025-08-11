import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { LogEntry, LogsResponse } from '../models/log.model'
import { environment } from '../../../environment/environment.prod'
import { AuthService } from './auth.service'

@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient, private auth: AuthService) {}

  // QUITAR: No necesitas headers manuales si tienes interceptor
  // private getHeaders(): HttpHeaders { ... }

  getLogs(page = 1, limit = 15): Observable<LogsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())

    // CORREGIR: Sin headers manuales, el interceptor se encarga
    return this.http.get<any>(`${this.baseUrl}/logs`, { params }).pipe(
      map((res: any) => {
        console.log('[LogsService] Respuesta de backend:', res)
        const currentUserId = this.auth.getUserId()
        const isPaginated = res && typeof res === 'object' && Array.isArray(res.data)
        const rawData: LogEntry[] = isPaginated ? res.data : Array.isArray(res) ? res : []

        // Ya no filtrar aquí si el backend ya filtra por usuario
        const filtered = rawData // Confiar en que el backend filtra

        if (isPaginated) {
          const perPage = res.perPage ?? limit
          const total = res.total ?? filtered.length // Usar el total del backend
          const lastPage = res.lastPage ?? Math.max(1, Math.ceil(total / perPage))
          const safePage = Math.min(page, lastPage)
          return {
            data: filtered,
            total,
            page: safePage,
            perPage,
            lastPage,
          } as unknown as LogsResponse
        }

        return {
          data: filtered,
          total: filtered.length,
          page: 1,
          perPage: filtered.length,
          lastPage: 1,
        } as unknown as LogsResponse
      }),
      catchError((error) => {
        console.error('[Error en getLogs]', error)
        return throwError(() => error)
      })
    )
  }

  getLogsByUser(userId: number, page = 1, limit = 15): Observable<LogEntry[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())

    // CORREGIR: Sin headers manuales
    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/user/${userId}`, { params }).pipe(
      catchError((error) => {
        console.error('[Error en getLogsByUser]', error)
        return throwError(() => error)
      })
    )
  }

  getLogsByTable(table: string, page = 1, limit = 15): Observable<LogEntry[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())

    // CORREGIR: Sin headers manuales
    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/table/${table}`, { params }).pipe(
      catchError((error) => {
        console.error('[Error en getLogsByTable]', error)
        return throwError(() => error)
      })
    )
  }
}
