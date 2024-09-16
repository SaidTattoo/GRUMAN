import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/users'; // URL de tu API de usuarios

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
}
