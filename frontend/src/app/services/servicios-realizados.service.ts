import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';
import { Observable } from 'rxjs';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Injectable({
  providedIn: 'root'
})
export class ServiciosRealizadosService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;
  create(serviciosRealizados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}servicios-realizados`, serviciosRealizados);
  }
  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}servicios-realizados`);
  }
}
