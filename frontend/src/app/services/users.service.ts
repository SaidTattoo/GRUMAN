import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../config';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl + 'users'; // Asegúrate que environment.apiUrl termine en '/'

  constructor(private http: HttpClient) { }

  getUsers(company?: string): Observable<any[]> {
    let params = new HttpParams();
    if (company) {
      params = params.set('company', company);
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getAllTecnicos(page: number = 1, limit: number = 10): Observable<any> {
    const url = `${this.apiUrl}/tecnicos`;
    const params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());
    
    console.log('URL de la petición:', url);
    return this.http.get(url, { params }).pipe(
        tap(response => console.log('Respuesta del servidor:', response)),
        catchError(error => {
            console.error('Error al obtener técnicos:', error);
            throw error;
        })
    );
  }
  
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
