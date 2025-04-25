import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InformeConsumoService {
  private apiUrl = `${environment.apiUrl}/informe-consumo`;

  constructor(private http: HttpClient) { }

  getInformeConsumo(fechaInicio: string, fechaFin: string, clienteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: {
        fechaInicio,
        fechaFin,
        clienteId: clienteId.toString()
      }
    });
  }
} 