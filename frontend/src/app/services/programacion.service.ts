import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ProgramacionService {

  constructor(private http: HttpClient) { }

  getProgramacion() {
    return this.http.get<any>(`${environment.apiUrl}programacion`);
  }
  createProgramacion(programacion: any) {
    return this.http.post<any>(`${environment.apiUrl}programacion`, programacion);
  }
  deleteProgramacion(id: number) {
    return this.http.delete<any>(`${environment.apiUrl}programacion/${id}`);
  }
  getProgramacionById(id: number) {
    return this.http.get<any>(`${environment.apiUrl}programacion/${id}`);
  }
  updateProgramacion(id: number, programacion: any) {
    return this.http.put<any>(`${environment.apiUrl}programacion/${id}`, programacion);
  }
}
