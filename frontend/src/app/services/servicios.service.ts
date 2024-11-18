import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;

  getAllServicios() {
    return this.http.get<any>(`${this.apiUrl}servicios`);
  }

  createServicio(servicio: any) {
    return this.http.post<any>(`${this.apiUrl}servicios`, servicio);
  }
}
