import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../config';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitarVisitaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  crearSolicitudVisita(solicitud: any) {
    return this.http.post(`${this.apiUrl}solicitar-visita`, solicitud);
  }

  getSolicitudesVisita(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}solicitar-visita`);
  }

  getSolicitudesAtendidasEnProceso(){
    return this.http.get<any>(`${this.apiUrl}solicitar-visita/atendidas_proceso`);
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

  aprobarSolicitudVisita(
    id: number, 
    tecnico_asignado_id: number,
    tecnico_asignado_id_2: number | null,
    especialidad: string,
    fechaVisita: Date,
    valorPorLocal: number
  ): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    const data = {
      tecnico_asignado_id,
      tecnico_asignado_id_2,
      aprobada_por_id: currentUser?.id,
      fechaVisita,
      especialidad,
      valorPorLocal
    };
     return this.http.post(`${this.apiUrl}solicitar-visita/${id}/aprobar`, data);
  }
  rechazarSolicitudVisita(id: number, data: any): Observable<any> {
    // Obtenemos el ID del usuario actual del localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userData = {
      motivo: data.motivo,
      rechazada_por_id: currentUser?.id
    };
    
    console.log('Rechazando solicitud con datos:', userData);
    
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/${id}/rechazar`, userData);
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

  updateRepuestos(solicitudId: string, changes: any) {
    return this.http.patch(`${this.apiUrl}solicitar-visita/${solicitudId}/repuestos`, changes);
  }

  getTecnicos() {
    return this.http.get(`${this.apiUrl}users/tecnicos`);
  }

  asignarTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
    return this.http.post(`${this.apiUrl}solicitar-visita/${solicitudId}/asignar-tecnico`, {
      tecnicoId,
      tipo
    });
  }

  cambiarTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
    console.log('Service: cambiarTecnico request:', { solicitudId, tecnicoId, tipo });
    return this.http.post(`${this.apiUrl}solicitar-visita/${solicitudId}/cambiar-tecnico`, {
      tecnicoId,
      tipo
    }).pipe(
      tap(response => console.log('Service: cambiarTecnico response:', response)),
      catchError(error => {
        console.error('Service: cambiarTecnico error:', error);
        throw error;
      })
    );
  }

  buscarSolicitud(searchParams: string[]): Observable<any> {
    if (!searchParams || searchParams.length === 0) {
      return of([]);
    }

    // Filtrar parámetros vacíos y convertir a string
    const parametros = searchParams
      .filter(param => param && param.trim().length > 0)
      .join(',');

    if (!parametros) {
      return of([]);
    }

    return this.http.get<any>(`${this.apiUrl}solicitar-visita/buscar/${parametros}`).pipe(
      catchError(error => {
        console.error('Error en la búsqueda:', error);
        return throwError(() => new Error('Error al realizar la búsqueda. Por favor, intente nuevamente.'));
      })
    );
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}solicitar-visita/${id}/pdf`, {
      responseType: 'blob'
    });
  }
  subirCargaMasiva(datos: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}solicitar-visita/subir-carga-masiva`, datos);
  }
  getSolicitudesVisitaMultifiltro(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}solicitar-visita/solicitudes-visita-multifiltro`, { params });
  }


  deleteSolicitud(id:number){
    return this.http.delete(`${this.apiUrl}solicitar-visita/${id}`)
  }

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}solicitar-visita/${id}/estado`, { status: estado });
  }
}
