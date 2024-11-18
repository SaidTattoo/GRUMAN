import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ListadoSolicitudAprobacionCorrectivaService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl + 'solicitudes-aprobacion-correctiva';

  findAllSolicitudesAprobacionCorrectiva() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createSolicitudAprobacionCorrectiva(solicitud: any) {
    return this.http.post<any>(this.apiUrl, solicitud);
  }

  removeSolicitudAprobacionCorrectiva(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
