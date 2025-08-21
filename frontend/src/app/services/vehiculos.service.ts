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
  //TODO: no implementado aun 
  updateVehiculo(id: number, vehiculo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}vehiculos/${id}`, vehiculo);
  }

  deleteVehiculo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}vehiculos/${id}`);
  }

  updateUserVehiculo(id: number, user_id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}vehiculos/${id}/user/${user_id}`, {});
  }

  removeUserVehiculo(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}vehiculos/${id}/remove-user`, {});
  }

  getDocumentacionVehiculo(id: string): Observable<any> {
    // Consultar directamente los documentos desde la base de datos
    return this.http.get<any[]>(`${this.apiUrl}documentos`).pipe(
      map((documentos: any[]) => {
        const vehiculoId = parseInt(id);
        
        // Filtrar documentos del vehículo específico que estén activos
        const documentosVehiculo = documentos.filter(doc => 
          doc.vehiculoId === vehiculoId && 
          doc.activo === true && 
          doc.deleted === false
        );

        // Estructura base para la documentación
        let documentacion: any = {
          revision_tecnica: null,
          permiso_circulacion: null,
          seguro_obligatorio: null,
          gases: null,
          otros: []
        };

        // Mapear los documentos encontrados a la estructura esperada
        documentosVehiculo.forEach(doc => {
          if (doc.tipo === 'otros') {
            documentacion.otros.push({
              id: doc.id,
              nombre: doc.nombre,
              url: doc.path,
              fecha: doc.fecha,
              fechaVencimiento: doc.fechaVencimiento
            });
          } else if (documentacion.hasOwnProperty(doc.tipo)) {
            documentacion[doc.tipo] = {
              id: doc.id,
              nombre: doc.nombre,
              url: doc.path,
              fecha: doc.fecha,
              fechaVencimiento: doc.fechaVencimiento
            };
          }
        });

        return documentacion;
      })
    );
  }
}
