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

  getLogs(page = 1, limit = 10): Observable<LogsResponse> { // Cambiado de 15 a 10
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, Math.min(limit, 100))

    const params = new HttpParams()
      .set('page', safePage.toString())
      .set('limit', safeLimit.toString())

    return this.http.get<any>(`${this.baseUrl}/logs`, { params }).pipe(
      map((res: any) => {
        console.log('[LogsService] Respuesta de backend:', res)

        if (!res || typeof res !== 'object') {
          console.warn('[LogsService] Respuesta inválida del backend')
          return {
            data: [],
            total: 0,
            page: 1,
            perPage: safeLimit,
            lastPage: 1,
          } as LogsResponse
        }

        const isPaginated = Array.isArray(res.data)
        const rawData: LogEntry[] = isPaginated ? res.data : Array.isArray(res) ? res : []

        if (isPaginated) {
          const total = Math.max(0, res.total ?? rawData.length)
          const perPage = Math.max(1, res.perPage ?? safeLimit)
          const lastPage = Math.max(1, res.lastPage ?? Math.ceil(total / perPage))
          const actualPage = Math.max(1, Math.min(safePage, lastPage))

          return {
            data: rawData,
            total,
            page: actualPage,
            perPage,
            lastPage,
          } as LogsResponse
        }

        return {
          data: rawData,
          total: rawData.length,
          page: 1,
          perPage: rawData.length,
          lastPage: 1,
        } as LogsResponse
      }),
      catchError((error) => {
        console.error('[Error en getLogs]', error)
        return throwError(() => error)
      })
    )
  }

  // Resto de métodos con limit por defecto 10
  getLogsByUser(userId: number, page = 1, limit = 10): Observable<LogEntry[]> {
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, Math.min(limit, 100))

    const params = new HttpParams()
      .set('page', safePage.toString())
      .set('limit', safeLimit.toString())

    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/user/${userId}`, { params }).pipe(
      catchError((error) => {
        console.error('[Error en getLogsByUser]', error)
        return throwError(() => error)
      })
    )
  }

  getLogsByTable(table: string, page = 1, limit = 10): Observable<LogEntry[]> {
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, Math.min(limit, 100))

    const params = new HttpParams()
      .set('page', safePage.toString())
      .set('limit', safeLimit.toString())

    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/table/${table}`, { params }).pipe(
      catchError((error) => {
        console.error('[Error en getLogsByTable]', error)
        return throwError(() => error)
      })
    )
  }
}
