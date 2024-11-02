import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class RegionesComunasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRegiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}regiones-comunas/regiones`);
  }

  getProvinciasByRegion(regionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}regiones-comunas/provincias/${regionId}`);
  }

  getComunasByProvincia(provinciaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}regiones-comunas/comunas/${provinciaId}`);
  }
}
