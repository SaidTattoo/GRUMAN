import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class RepuestosService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;
  getRepuestos() {
    return this.http.get<any[]>(this.apiUrl + 'repuestos');
  }
}
