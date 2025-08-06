import { Injectable } from '@angular/core'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { LogEntry } from '../models/log.model'
import { environment } from '../../../environment/environment.prod'

@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly baseUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken')
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
  }

  getLogs(page = 1, limit = 15): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())

    return this.http.get<any>(`${this.baseUrl}/logs`, {
      params,
      headers: this.getHeaders()
    }).pipe(
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

    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/user/${userId}`, {
      params,
      headers: this.getHeaders()
    }).pipe(
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

    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs/table/${table}`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('[Error en getLogsByTable]', error)
        return throwError(() => error)
      })
    )
  }
}
