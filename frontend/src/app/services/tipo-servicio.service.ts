import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoServicioService {

  constructor(private http: HttpClient) { }

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}tipo-servicio`);
  }

  createTipoServicio(tipoServicio: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}tipo-servicio`, tipoServicio);
  }
}
