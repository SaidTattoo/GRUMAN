import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';
import { tap } from 'rxjs/operators';

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

 
  getSolicitudesAprobadas(): Observable<any> {
    console.log('Solicitando aprobadas...');
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/aprobadas`).pipe(
      tap(response => console.log('Respuesta aprobadas:', response))
    );
  }

  getSolicitudesRechazadas(): Observable<any> {
    console.log('Solicitando rechazadas...');
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/rechazadas`).pipe(
      tap(response => console.log('Respuesta rechazadas:', response))
    );
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
  getPendientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/pendientes`);
  }
  updateSolicitudVisita(id: number, solicitud: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}solicitar-visita/${id}`, solicitud);
  }
}
