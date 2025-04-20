import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOrdenesServicio() {
    return this.http.get(`${this.apiUrl}orden-servicio`);
  }

  getOrdenesServicioPorEstado(estado: any, tipoServicio: any) {
    return this.http.get(`${this.apiUrl}orden-servicio/estado/${estado}/${tipoServicio}`);
  }

  getServiciosAutorizadosPendientesVisita() {
    return this.http.get(`${this.apiUrl}orden-servicio/estado/autorizado/pendiente_visita`);
  }

  getProximasVisitasPreventivas() {
    return this.http.get(`${this.apiUrl}orden-servicio/preventivas/proximas`);
  }

  getServiciosDelDia() {
    return this.http.get(`${this.apiUrl}orden-servicio/servicios-del-dia`);
  }

  getCumplimientoPreventivos() {
    return this.http.get(`${this.apiUrl}orden-servicio/cumplimiento-preventivos`);
  }

  getGastosRepuestos() {
    return this.http.get(`${this.apiUrl}orden-servicio/gastos-repuestos`);
  }

  getPerformanceReactivos() {
    return this.http.get(`${this.apiUrl}orden-servicio/performance-reactivos`);
  }

  getGastoTotalAcumulado() {
    return this.http.get(`${this.apiUrl}orden-servicio/gasto-total`);
  }
  
  /**
   * Obtiene los contadores del dashboard
   * @param clientId ID del cliente (opcional)
   * @returns Observable con los contadores
   */
  getContadores(clientId?: number): Observable<any> {
    let params = new HttpParams();
    
    // Solo agregar el parámetro si está definido
    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/dashboard/contadores`, { params });
  }

  getEstadisticasPorCliente() {
    return this.http.get(`${this.apiUrl}dashboard/estadisticas-por-cliente`);
  }

  /**
   * Obtiene las estadísticas mensuales para el dashboard
   * @param year Año para las estadísticas
   * @param clientId ID del cliente (opcional)
   * @returns Observable con las estadísticas mensuales
   */
  getEstadisticasMensuales(year: number, clientId?: number): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString());
    
    // Solo agregar el parámetro si está definido
    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/dashboard/estadisticas-mensuales`, { params });
  }

  // New methods that only return quantities/counts
  
  /**
   * Get only counter values for the dashboard
   * @param clientId Optional client ID to filter results
   * @returns An Observable with counts of requests by status
   */
  getContadoresCantidad(clientId?: number): Observable<{
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    enServicio: number;
    finalizadas: number;
    validadas: number;
    total: number;
  }> {
    const params: { [key: string]: string } = {};
    if (clientId !== undefined) {
      params['clientId'] = clientId.toString();
    }
    return this.http.get<{
      pendientes: number;
      aprobadas: number;
      rechazadas: number;
      enServicio: number;
      finalizadas: number;
      validadas: number;
      total: number;
    }>(`${this.apiUrl}dashboard/contadores`, { params });
  }

  /**
   * Get only statistical counts by client
   * @returns An Observable with client statistics
   */
  getEstadisticasCantidadPorCliente(): Observable<{
    clienteId: number;
    clienteNombre: string;
    solicitudesPendientes: number;
    solicitudesEnProceso: number;
    solicitudesFinalizadas: number;
    totalSolicitudes: number;
  }[]> {
    return this.http.get<{
      clienteId: number;
      clienteNombre: string;
      solicitudesPendientes: number;
      solicitudesEnProceso: number;
      solicitudesFinalizadas: number;
      totalSolicitudes: number;
    }[]>(`${this.apiUrl}dashboard/estadisticas-por-cliente`);
  }

  /**
   * Get only monthly statistics counts
   * @param year Year to get statistics for
   * @param clientId Optional client ID to filter results
   * @returns An Observable with monthly statistics counts
   */
  getEstadisticasMensualesCantidad(year: number, clientId?: number): Observable<{
    [month: string]: {
      pendientes: number;
      aprobadas: number;
      enServicio: number;
      finalizadas: number;
      validadas: number;
      rechazadas: number;
      total: number;
    }
  }> {
    const params: { [key: string]: string } = { year: year.toString() };
    if (clientId !== undefined) {
      params['clientId'] = clientId.toString();
    }
    return this.http.get<{
      [month: string]: {
        pendientes: number;
        aprobadas: number;
        enServicio: number;
        finalizadas: number;
        validadas: number;
        rechazadas: number;
        total: number;
      }
    }>(`${this.apiUrl}dashboard/estadisticas-mensuales`, { params });
  }

  getGastosRepuestosCantidad() {
    return this.http.get(`${this.apiUrl}dashboard/gastos-repuestos`);
  }

  /**
   * Obtiene las solicitudes pendientes más recientes
   * @param limit Límite de registros a obtener
   * @param clientId ID del cliente (opcional)
   * @returns Observable con las solicitudes pendientes
   */
  getSolicitudesPendientesRecientes(limit: number = 5, clientId?: number): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString());
    
    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/dashboard/solicitudes-pendientes-recientes`, { params });
  }

  /**
   * Obtiene las solicitudes finalizadas más recientes
   * @param limit Límite de registros a obtener
   * @param clientId ID del cliente (opcional)
   * @returns Observable con las solicitudes finalizadas
   */
  getSolicitudesFinalizadasRecientes(limit: number = 5, clientId?: number): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString());
    
    if (clientId !== undefined && clientId !== null) {
      params = params.set('clientId', clientId.toString());
    }
    
    return this.http.get(`${this.apiUrl}/dashboard/solicitudes-finalizadas-recientes`, { params });
  }
}
