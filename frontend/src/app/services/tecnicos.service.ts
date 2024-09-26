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
    return this.http.get(`${this.apiUrl}tecnicos`);
  }
  getTecnico(id: number) {
    return this.http.get(`${this.apiUrl}tecnicos/${id}`);
  }
  createTecnico(tecnico: any) {
    return this.http.post(`${this.apiUrl}tecnicos`, tecnico);
  }
  updateTecnico(id: number, tecnico: any) {
    return this.http.put(`${this.apiUrl}tecnicos/${id}`, tecnico);
  }
  deleteTecnico(id: number) {
    return this.http.delete(`${this.apiUrl}tecnicos/${id}`);
  }
}
