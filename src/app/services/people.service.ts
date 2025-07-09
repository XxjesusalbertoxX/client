// src/app/services/people.service.ts
import { Injectable } from '@angular/core'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { StatsResponse } from '../models/stats.model'


@Injectable({ providedIn: 'root' })
export class PeopleService {
  private baseUrl = 'http://localhost:3333'

  constructor(private http: HttpClient) {}

  getPeople(page = 1): Observable<any> {
    const params = new HttpParams().set('page', page.toString())
    console.log(params.toString())
    return this.http.get(`${this.baseUrl}/people`, { params })
  }

  deletePerson(id: string): Observable<any> {
    console.log(`Deleting person with ID: ${id}`)
    return this.http.patch(`${this.baseUrl}/people/${id}/deactivate`,{})
  }

  getPersonById(id: string): Observable<any> {
    console.log(`Fetching person with ID: ${id}`)
    return this.http.get(`${this.baseUrl}/people/${id}`).pipe(
      catchError((error) => {
        console.error('[Error en getPersonById]', error)
        return throwError(() => error) // Propaga el error al componente
      })
    )
  }

  createPerson(payload: any) {
    return this.http.post(`${this.baseUrl}/people`, payload).pipe(
      catchError((error) => {
        console.error('[Error en createPerson]', error)
        return throwError(() => error) // Propaga el error al componente
      })
    )
  }

  updatePerson(id: string, payload: any): Observable<any> {
    console.log('[Payload de actualización de persona]', payload)
    return this.http.put(`${this.baseUrl}/people/${id}`, payload)
  }

  getStatistics(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/people/statistics`)
  }

}
