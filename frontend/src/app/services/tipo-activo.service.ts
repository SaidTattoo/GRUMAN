import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class TipoActivoService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  getTiposActivo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}tipo-activo`);
  }
  eliminarTipoActivo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}tipo-activo/${id}`);
  }
  crearTipoActivo(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}tipo-activo`, data);
  }
}
