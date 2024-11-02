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
}
