import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

interface ServiciosRealizadosParams {
  tipoBusqueda: string;
  clientId: string;
  fechaInicio?: string;
  fechaFin?: string;
  mesFacturacion?: string;
  tipoServicio?: string;
  tipoSolicitud?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosRealizadosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(serviciosRealizados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}solicitar-visita/servicios-realizados`, serviciosRealizados);
  }

  getAll(params: ServiciosRealizadosParams) {
    console.log('[Frontend Service] Sending request with params:', params);
    // Filtrar parámetros que sean undefined o la cadena "undefined"
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== 'undefined')
    );
    
    return this.http.get(`${this.apiUrl}solicitar-visita/servicios-realizados`, { 
      params: cleanParams as any 
    });
  }
}
