import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface InformesConsumo {
  requerimiento: string;
  servicio: string;
  local: string;
  repuesto: string;
  cliente: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  valor: number;
  fecha: Date;
  visitaTecnico: string;
}

@Injectable({
  providedIn: 'root'
})
export class InformeGastosAcumuladosService {
  constructor(private readonly http: HttpClient) { }

  getInformeConsumo(fechaInicio: any | null, fechaFin: any | null, clienteId: any | null): Observable<InformesConsumo[]> {
    return this.http.get<InformesConsumo[]>(`${environment.apiUrl}/informe-consumo`, {
      params: { fechaInicio: fechaInicio || null, fechaFin: fechaFin || null, clienteId: clienteId || null }
    });
  }

  getMesesByCliente(clienteId: any | null): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/facturacion/${clienteId}`);
  }
}