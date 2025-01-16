import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TecnicosService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
  getTecnicos() {
    return this.http.get(`${this.apiUrl}users`);
  }
  getTecnico(id: number) {
    return this.http.get(`${this.apiUrl}users/tecnicos/${id}`);
  }
  createTecnico(tecnico: any) {
    return this.http.post(`${this.apiUrl}users`, tecnico);
  }
  updateTecnico(id: number, data: any) {
    return this.http.put(`${this.apiUrl}users/${id}`, {
        ...data,
        clients: data.clientId
    });
  }


  updateTecnicoGruman(id: number, data: any) {
    return this.http.put(`${this.apiUrl}users/${id}`, data);
  }


  deleteTecnico(id: number) {
    return this.http.delete(`${this.apiUrl}users/tecnicos/${id}`);
  }

  getTecnicosGruman(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}users/tecnicos-gruman`);
  }

  getTecnicoClientes(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}users/tecnicos/${id}/clientes`);
  }
}
