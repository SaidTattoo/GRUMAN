import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SolicitarVisitaService {

  constructor(private http: HttpClient    ) { }
  private apiUrl = environment.apiUrl;
  crearSolicitudVisita(solicitudVisita: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}solicitar-visita`, solicitudVisita);
  }
  getSolicitudesVisita(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}solicitar-visita`);
  }
  getSolicitudVisita(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/${id}`);
  }

  aprobarSolicitudVisita(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/${id}/aprobar`, {});
  }
  rechazarSolicitudVisita(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/${id}/rechazar`, {});
  }
}
