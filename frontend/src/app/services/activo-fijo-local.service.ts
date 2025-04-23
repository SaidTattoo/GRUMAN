import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})

export class ActivoFijoLocalService {

  constructor( private http: HttpClient ) { }

  listar() {
    return this.http.get<any>(`${environment.apiUrl}activo-fijo-local`);
  }

  getById(id: number) {
    return this.http.get<any>(`${environment.apiUrl}activo-fijo-local/${id}`);
  }

  crear(activoFijoLocal: any) {
    return this.http.post<any>(`${environment.apiUrl}activo-fijo-local`, activoFijoLocal);
  }

  actualizar(activoFijoLocal: any) {
    return this.http.put<any>(`${environment.apiUrl}activo-fijo-local/${activoFijoLocal.id}`, activoFijoLocal);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${environment.apiUrl}activo-fijo-local/${id}`);
  }
}
