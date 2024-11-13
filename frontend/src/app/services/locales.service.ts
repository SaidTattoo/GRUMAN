import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  constructor( private http: HttpClient ) { }
  private apiUrl = environment.apiUrl + 'locales';

  getLocales(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  crearLocal(local: any): Observable<any> {
    console.log('****', local);
    return this.http.post<any>(this.apiUrl, local);
  }
  getLocalById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updateLocal(id: number, local: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, local);
  }
  deleteLocal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getLocalesByCliente(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cliente/${id}`);
  }
  addSectorToLocal(localId: number, sectorData: Partial<any>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${localId}/sectores`, sectorData);
  }
}
