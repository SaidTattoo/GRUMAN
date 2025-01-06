import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor( private http: HttpClient ) { }

  getReactivosPendientesAutorizacion() {
    return this.http.get(`${environment.apiUrl}/dashboard/reactivos-pendientes-autorizacion`);
  }
}
