import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  constructor(private readonly http: HttpClient) { }

  generarReporteExcel(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/activo-fijo-local/excel`, {
      responseType: 'blob'
    });
  }
}