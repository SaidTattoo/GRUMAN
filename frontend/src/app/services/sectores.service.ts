import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class SectoresService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createSector(sector: any): Observable<any> {
    return this.http.post(`${this.apiUrl}sectores-trabajo-default`, sector);
  }

  getSectores(): Observable<any> {
    return this.http.get(`${this.apiUrl}sectores-trabajo-default`);
  }
  createSectorDefault(sector: any): Observable<any> {
    return this.http.post(`${this.apiUrl}sectores-trabajo-default`, sector);
  }
}
