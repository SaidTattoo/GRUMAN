import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../config';
import { MenuService } from './menu.service';
import { NavItem } from '../layouts/full/vertical/sidebar/nav-item/nav-item';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + 'auth';
  private apiUrlPass = environment.apiUrl ; // URL de tu API de autenticación
  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser: Observable<any | null>;

  constructor(private http: HttpClient, private router: Router, private menuService: MenuService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        const decodedToken: any = jwtDecode(response.token);
        const user: any = {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          profile: decodedToken.profile,
          companies: decodedToken.clients, // Manejar array de compañías
          token: response.token,
          exp: decodedToken.exp // Añadir la fecha de expiración del token
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        const newMenuItems = this.getMenuItemsForUser(user);
        this.menuService.updateMenuItems(newMenuItems);
      })
    );
  }
  private getMenuItemsForUser(user: any): any[] {
    // Lógica para determinar los elementos del menú según el usuario
    if (user.profile === 'admin') {
      return this.adminNavItems; // Define adminNavItems según tus necesidades
    } else {
      return this.userNavItems; // Define userNavItems según tus necesidades
    }
  }
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // Notificar al servicio de menú para que restablezca los elementos
  
    this.menuService.updateMenuItems([]);
    this.router.navigate(['/authentication/login']);
  }
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (user && user.token) {
      const currentTime = Math.floor(Date.now() / 1000);
      return user.exp > currentTime; // Verificar si el token ha expirado
    }
    return false;
  }

  getToken(): string | null {
    return this.currentUserValue ? this.currentUserValue.token : null;
  }

  getUserProfile(): any | null {
    return this.currentUserValue;
  }
  /* @Patch(':id/password') */
  changePassword(id: number, password: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrlPass}users/${id}/password`, { password });
  }






  private adminNavItems: NavItem[] = [
    {
      displayName: 'Dashboard',
      iconName: 'dashboard',
      route: '/admin/dashboard',
    },
    {
      displayName: 'User Management',
      iconName: 'people',
      route: '/admin/users',
    },
    // Otros elementos específicos para administradores
  ];

  private userNavItems: NavItem[] = [
    {
      displayName: 'Home',
      iconName: 'home',
      route: '/home',
    },
    {
      displayName: 'Profile',
      iconName: 'person',
      route: '/profile',
    },
    // Otros elementos específicos para usuarios regulares
  ];
}
