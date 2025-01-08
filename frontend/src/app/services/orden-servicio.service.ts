import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class OrdenServicioService {

  constructor(private http: HttpClient   ) { }
  private apiUrl = environment.apiUrl + 'orden-servicio';
  getOrdenesServicio() {
    return this.http.get(`${this.apiUrl}`);
  }

  crearOrdenServicioGenerarProgramacion(ordenServicio: any) {
    return this.http.post(`${this.apiUrl}/crear-orden`, ordenServicio);
  }
  createSolicitudCorrectiva(solicitudCorrectiva: any) {
    return this.http.post(`${this.apiUrl}/crear-orden`, solicitudCorrectiva);
  }
}
