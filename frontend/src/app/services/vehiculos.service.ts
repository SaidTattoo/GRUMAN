import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getVehiculoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}vehiculos/${id}`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}vehiculos`);
  }

  crearVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}vehiculos`, vehiculo);
  }

  getDocumentacionVehiculo(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}upload/vehiculos/${id}/documentos`).pipe(
      map(response => {
        // Convertir las fechas a objetos Date
        const documentacion = response as any;
        Object.keys(documentacion).forEach(key => {
          if (documentacion[key]?.fecha) {
            documentacion[key].fecha = new Date(documentacion[key].fecha);
          }
        });
        return documentacion;
      })
    );
  }
}
