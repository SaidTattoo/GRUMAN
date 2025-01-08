import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  getOrdenesServicio() {
    return this.http.get(`${environment.apiUrl}orden-servicio`);
  }

  getOrdenesServicioPorEstado(estado: any, tipoServicio: any) {
    return this.http.get(`${environment.apiUrl}orden-servicio/estado/${estado}/${tipoServicio}`);
  }

  getServiciosAutorizadosPendientesVisita() {
    return this.http.get(`${environment.apiUrl}orden-servicio/estado/autorizado/pendiente_visita`);
  }

  getProximasVisitasPreventivas() {
    return this.http.get(`${environment.apiUrl}orden-servicio/preventivas/proximas`);
  }

  getServiciosDelDia() {
    return this.http.get(`${environment.apiUrl}orden-servicio/servicios-del-dia`);
  }

  getCumplimientoPreventivos() {
    return this.http.get(`${environment.apiUrl}orden-servicio/cumplimiento-preventivos`);
  }

  getGastosRepuestos() {
    return this.http.get(`${environment.apiUrl}orden-servicio/gastos-repuestos`);
  }

  getPerformanceReactivos() {
    return this.http.get(`${environment.apiUrl}orden-servicio/performance-reactivos`);
  }

  getGastoTotalAcumulado() {
    return this.http.get(`${environment.apiUrl}orden-servicio/gasto-total`);
  }
}
