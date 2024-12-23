import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient ) { }
  getClientes() {
    return this.http.get<any[]>(this.apiUrl + 'client');
  }
  getCliente(id: number) {
    return this.http.get<any>(this.apiUrl + 'client/' + id);
  }
  createCliente(cliente: any) {
    return this.http.post<any>(this.apiUrl + 'client', cliente);
  }
  updateCliente(id: number, cliente: any) {
    return this.http.put<any>(this.apiUrl + 'client/' + id, cliente);
  }
  deleteCliente(id: number) {
    return this.http.delete<any>(this.apiUrl + 'client/' + id);
  }
  findIdClientByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}client/name/${name}`);
  }
  updateListaInspeccion(clientId: number, listaInspeccion: any[]) {
    return this.http.put(`${this.apiUrl}client/${clientId}`, { listaInspeccion });
  }
  getListaInspeccion(clienteId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}client/${clienteId}/lista-inspeccion`);
  }
  updateMesDeFacturacion(id: number, fechaInicioFacturacion: string, fechaFinFacturacion: string, fechaMesFacturacion: string) {
    return this.http.put(`${this.apiUrl}client/mes/${id}`, { fechaInicioFacturacion, fechaFinFacturacion, fechaMesFacturacion });
  }
}
