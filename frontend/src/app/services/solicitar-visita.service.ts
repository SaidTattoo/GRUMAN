import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SolicitarVisitaService {

  constructor(private http: HttpClient) { }
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
    console.log('Actualizando solicitud:', { id, solicitud });
    return this.http.put<any>(`${this.apiUrl}solicitar-visita/${id}`, solicitud).pipe(
      tap(response => console.log('Respuesta de actualización:', response))
    );
  }

  getSolicitudesFinalizadas(): Observable<any> {
    console.log('Solicitando finalizadas...');
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/finalizadas`).pipe(
      tap(response => console.log('Respuesta finalizadas:', response))
    );
  }

  getSolicitudesValidadas(): Observable<any> {
    console.log('Solicitando validadas...');
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/validadas`).pipe(
      tap(response => console.log('Respuesta validadas:', response))
    );
  }

  reabrirSolicitud(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/${id}/reabrir`, {}).pipe(
      tap(response => console.log('Solicitud reabierta:', response))
    );
  }

  validarSolicitud(id: number, data: any): Observable<any> {
    console.log('Validando solicitud:', { id, data });
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/${id}/validar`, data).pipe(
      tap(response => console.log('Respuesta de validación:', response))
    );
  }

  getSolicitudesDelDia(): Observable<any> {
    console.log('[Frontend Service] Solicitando solicitudes del día...');
    return this.http.get(`${this.apiUrl}solicitar-visita/solicitudes-del-dia`).pipe(
        tap(response => console.log('[Frontend Service] Respuesta recibida:', response)),
        catchError(error => {
            console.error('[Frontend Service] Error al obtener solicitudes:', error);
            throw error;
        })
    );
  }

  getSolicitudesDelDiaPorCliente(clientId: number): Observable<any> {
    console.log('[Frontend Service] Solicitando solicitudes del día...');
    return this.http.get(`${this.apiUrl}solicitar-visita/solicitudes-del-dia/${clientId}`).pipe(
        tap(response => console.log('[Frontend Service] Respuesta recibida:', response)),
        catchError(error => {
            console.error('[Frontend Service] Error al obtener solicitudes:', error);
            throw error;
        })
    );
  }
}
