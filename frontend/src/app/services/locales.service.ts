import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  constructor( private http: HttpClient ) { }

  getLocales(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/locales');
  }
  crearLocal(local: any): Observable<any> {
    return this.http.post<any>('http://localhost:3000/locales', local);
  }
}
