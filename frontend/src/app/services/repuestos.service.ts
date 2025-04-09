import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RepuestosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRepuestos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/repuestos`);
  }

  getRepuesto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/repuestos/${id}`);
  }

  crearRepuesto(repuesto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/repuestos`, repuesto);
  }

  actualizarRepuesto(id: number, repuesto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/repuestos/${id}`, repuesto);
  }

  eliminarRepuesto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/repuestos/${id}`);
  }

  // Nuevos métodos para gestionar precios por cliente
  getClientePreciosForRepuesto(repuestoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente-repuesto/repuesto/${repuestoId}`);
  }

  updateClienteRepuesto(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cliente-repuesto/${id}`, data);
  }

  createClienteRepuesto(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cliente-repuesto`, data);
  }

  getHistorialClienteRepuesto(clienteRepuestoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente-repuesto/${clienteRepuestoId}/historial`);
  }

  sincronizarClientesRepuestos(): Observable<{ creados: number }> {
    return this.http.post<{ creados: number }>(
      `${this.apiUrl}/repuestos/sincronizar-clientes`,
      {}
    );
  }
}
