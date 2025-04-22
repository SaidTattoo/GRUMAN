import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl + 'facturacion';

  updateMesDeFacturacion(id: number, data: { fecha_inicio: string; fecha_termino: string }) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }


  generarFacturacionMensualAutomatica(id_cliente: number, anio_inicio: number, anios: number) {
    return this.http.get(`${this.apiUrl}/generar-facturacion/${id_cliente}/${anio_inicio}/${anios}`);
  }

  // Nuevo método para ejecutar manualmente
  generarFacturacionMensualManual() {
    return this.http.post(`${this.apiUrl}/generar-facturacion-manual`, {});
  }

  buscarFacturacion(mes: string, id_cliente: number) {
    return this.http.get(`${this.apiUrl}/buscar-facturacion/${mes}/${id_cliente}`);
  }
}
