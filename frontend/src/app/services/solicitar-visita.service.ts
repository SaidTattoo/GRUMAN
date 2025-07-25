import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../config';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitarVisitaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  crearSolicitudVisita(solicitud: any) {
    debugger
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
    return this.http.get<any>(
      `${this.apiUrl}solicitar-visita/${id}`
    );
  }

  getRepuestosById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}repuestos/${id}`
    );
  }

  getSolicitudVisitaChecklist(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}solicitar-visita/${id}/response-checklist`
    );
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
    console.log('🌐 Realizando petición HTTP para PDF, ID:', id);
    console.log('🔗 URL completa:', `${this.apiUrl}solicitar-visita/${id}/pdf`);
    
    return this.http.get(`${this.apiUrl}solicitar-visita/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('📡 Respuesta HTTP recibida:', {
          status: response.status,
          statusText: response.statusText,
          headers: {
            contentType: response.headers.get('Content-Type'),
            contentLength: response.headers.get('Content-Length'),
            contentDisposition: response.headers.get('Content-Disposition')
          },
          bodySize: response.body?.size
        });
        
        if (!response.body) {
          throw new Error('Respuesta HTTP sin cuerpo');
        }
        
        return response.body;
      }),
      catchError(error => {
        console.error('🚨 Error en petición HTTP del PDF:', error);
        console.error('📊 Estado de la respuesta:', error.status);
        console.error('📝 Mensaje de error:', error.message);
        
        if (error.status === 0) {
          console.error('❌ Error de red o CORS');
        } else if (error.status >= 500) {
          console.error('❌ Error del servidor backend');
        } else if (error.status >= 400) {
          console.error('❌ Error del cliente (solicitud incorrecta)');
        }
        
        return throwError(() => error);
      })
    );
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

  enviarEmail(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}solicitar-visita/${id}/enviar-email`, {});
  }

  updateChecklistVisita(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}solicitar-visita/update-checklist-visita/${id}`, data);
  } 
}
