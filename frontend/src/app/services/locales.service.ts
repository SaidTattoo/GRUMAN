import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';
@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLocales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}locales`);
  }
  
  getLocalesPaginados(
    page: number = 1, 
    limit: number = 10, 
    clientId?: number, 
    search?: string
  ): Observable<{data: any[], total: number}> {
    let url = `${this.apiUrl}locales?page=${page}&limit=${limit}`;
    
    if (clientId) {
      url += `&clientId=${clientId}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    return this.http.get<{data: any[], total: number}>(url);
  }

  crearLocal(local: any): Observable<any> {
    //console.log('****', local);
    return this.http.post<any>(`${this.apiUrl}locales`, local);
  }
  getLocalById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}locales/${id}`);
  }
  updateLocal(id: number, local: any): Observable<any> {
    return this.http.put(`${this.apiUrl}locales/${id}`, local);
  }
  deleteLocal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}locales/${id}`);
  }
  getLocalesByCliente(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}locales/cliente/${id}`);
  }
  addSectorToLocal(localId: number, sectorData: Partial<any>): Observable<any> {
    return this.http.post(`${this.apiUrl}locales/${localId}/sectores`, sectorData);
  }
}
