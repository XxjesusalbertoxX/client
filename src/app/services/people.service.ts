import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { StatsResponse } from '../models/stats.model'
import { environment } from '../../../environment/environment.prod';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de personas con paginación
   * @param page - Número de página (por defecto 1)
   * @returns Observable con los datos paginados de personas
   */
  getPeople(page = 1): Observable<any> {
    const params = new HttpParams().set('page', page.toString())
    console.log(params.toString())
    return this.http.get(`${this.baseUrl}/people`, { params })
  }

  /**
   * Desactiva (elimina lógicamente) una persona por su ID
   * @param id - ID de la persona a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deletePerson(id: string): Observable<any> {
    console.log(`Deleting person with ID: ${id}`)
    return this.http.patch(`${this.baseUrl}/people/${id}/deactivate`,{}).pipe(
      catchError((error) => {
        console.error('[Error en deletePerson]', error)
        return throwError(() => error)
      })
    )
  }

  /**
   * Obtiene una persona específica por su ID
   * @param id - ID de la persona a buscar
   * @returns Observable con los datos de la persona
   */
  getPersonById(id: string): Observable<any> {
    console.log(`Fetching person with ID: ${id}`)
    return this.http.get(`${this.baseUrl}/people/${id}`).pipe(
      catchError((error) => {
        console.error('[Error en getPersonById]', error)
        return throwError(() => error)
      })
    )
  }

  /**
   * Crea una nueva persona en el sistema
   * @param payload - Datos de la persona a crear
   * @returns Observable con la respuesta del servidor
   */
  createPerson(payload: any) {
    return this.http.post(`${this.baseUrl}/people`, payload).pipe(
      catchError((error) => {
        console.error('[Error en createPerson]', error)
        return throwError(() => error)
      })
    )
  }

  /**
   * Actualiza los datos de una persona existente
   * @param id - ID de la persona a actualizar
   * @param payload - Nuevos datos de la persona
   * @returns Observable con la respuesta del servidor
   */
  updatePerson(id: string, payload: any): Observable<any> {
    console.log('[Payload de actualización de persona]', payload)
    return this.http.put(`${this.baseUrl}/people/${id}`, payload)
  }

  /**
   * Obtiene las estadísticas generales de personas
   * @returns Observable con las estadísticas del sistema
   */
  getStatistics(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/people/statistics`)
  }
}
