import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient ) { }
  getClientes() {
    return this.http.get<any[]>(this.apiUrl + 'clientes');
  }
  getCliente(id: number) {
    return this.http.get<any>(this.apiUrl + 'clientes/' + id);
  }
  createCliente(cliente: any) {
    return this.http.post<any>(this.apiUrl + 'clientes', cliente);
  }
  updateCliente(id: number, cliente: any) {
    return this.http.put<any>(this.apiUrl + 'clientes/' + id, cliente);
  }
  deleteCliente(id: number) {
    return this.http.delete<any>(this.apiUrl + 'clientes/' + id);
  }
}
