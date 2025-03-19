import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class CausaRaizService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}causas-raiz`);
  }

  findOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}causas-raiz/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}causas-raiz`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}causas-raiz/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}causas-raiz/${id}`);
  }
} 