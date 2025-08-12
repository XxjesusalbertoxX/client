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

  getLogs(page = 1, limit = 15): Observable<LogsResponse> {
    // VALIDAR: Parámetros de entrada
    const safePage = Math.max(1, page)
    const safeLimit = Math.max(1, Math.min(limit, 100)) // Limitar a máximo 100

    const params = new HttpParams()
      .set('page', safePage.toString())
      .set('limit', safeLimit.toString())

    return this.http.get<any>(`${this.baseUrl}/logs`, { params }).pipe(
      map((res: any) => {
        console.log('[LogsService] Respuesta de backend:', res)

        // MEJORAR: Validación de respuesta más robusta
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

        // Respuesta sin paginación
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

        // MEJORAR: Devolver respuesta vacía pero válida en caso de error
        const fallbackResponse: LogsResponse = {
          data: [],
          total: 0,
          page: 1,
          perPage: safeLimit,
          lastPage: 1,
        }

        // En lugar de throwError, devolver respuesta fallback
        return throwError(() => ({
          ...error,
          fallback: fallbackResponse
        }))
      })
    )
  }

  getLogsByUser(userId: number, page = 1, limit = 15): Observable<LogEntry[]> {
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

  getLogsByTable(table: string, page = 1, limit = 15): Observable<LogEntry[]> {
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
