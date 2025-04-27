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

interface MesFacturacion {
  id_facturacion: number;
  mes: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  hh: number;
  cliente: any;
}

@Injectable({
  providedIn: 'root',
})
export class InformeConsumoService {
  constructor(private readonly http: HttpClient) {}

  getMesFacturacion(clienteId: string): Observable<MesFacturacion[]> {
    return this.http.get<MesFacturacion[]>(
      `${environment.apiUrl}/facturacion/${clienteId}`
    );
  }

  getInformeConsumoMesFacturacion(
    clienteId: string,
    mesFacturacion: string
  ): Observable<InformesConsumo[]> {
    return this.http.get<InformesConsumo[]>(
      `${environment.apiUrl}/informe-mes-facturacion?companyId=${clienteId}&mesFacturacion=${mesFacturacion}`
    );
  }
}
