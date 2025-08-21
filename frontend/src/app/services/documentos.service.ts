import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  constructor(private http: HttpClient) { }

  getDocumentos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}documentos`);
  }
  createDocumento(documento: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}documentos`, documento);
  }
  getTipoDocumentos(): Observable<any[]> {
    //console.log('getTipoDocumentos');
    return this.http.get<any[]>(`${environment.apiUrl}tipo-documento`);
  }

  createTipoDocumento(tipoDocumento: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}tipo-documento`, tipoDocumento);
  }

  deleteTipoDocumento(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}tipo-documento/${id}`);
  }

  actualizarFechaVencimiento(documentoId: number, fechaVencimiento: Date): Observable<any> {
    return this.http.patch(`${environment.apiUrl}vehiculos/documentos/${documentoId}/fecha-vencimiento`, { fechaVencimiento });
  }

  eliminarDocumento(vehiculoId: string, tipo: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}documentos/vehiculos/${vehiculoId}/documentos/${tipo}`);
  }
}
