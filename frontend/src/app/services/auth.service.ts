import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // URL de tu API de autenticación
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.authStatusSubject.next(true);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authStatusSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserProfile(): { name: string, profile: string, company: string, email: string } | null {
    const token = this.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return { name: decoded.name, profile: decoded.profile, company: decoded.company, email: decoded.email }; // Asegúrate de que el token tenga campos 'name', 'profile', 'company' y 'email'
    }
    return null;
  }
}
