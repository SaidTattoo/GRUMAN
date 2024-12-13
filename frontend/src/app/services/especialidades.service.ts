import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;
  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'especialidad');
  }
  findById(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'especialidad/' + id);
  }

  create(especialidad: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'especialidad', especialidad);
  }

  update(id: number, especialidad: any): Observable<any> {
    return this.http.put<any>(this.apiUrl + 'especialidad/' + id, especialidad);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + 'especialidad/' + id);
  }
}
