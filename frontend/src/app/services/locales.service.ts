import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  constructor( private http: HttpClient ) { }
  private apiUrl = environment.apiUrl + 'locales';

  getLocales(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  crearLocal(local: any): Observable<any> {
    console.log('****', local);
    return this.http.post<any>(this.apiUrl, local);
  }
}
