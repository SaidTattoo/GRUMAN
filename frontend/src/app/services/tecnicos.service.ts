import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

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
    return this.http.get(`${this.apiUrl}users/${id}`);
  }
  createTecnico(tecnico: any) {
    return this.http.post(`${this.apiUrl}users`, tecnico);
  }
  updateTecnico(id: number, tecnico: any) {
    return this.http.put(`${this.apiUrl}users/${id}`, tecnico);
  }
  deleteTecnico(id: number) {
    return this.http.delete(`${this.apiUrl}users/${id}`);
  }
}
