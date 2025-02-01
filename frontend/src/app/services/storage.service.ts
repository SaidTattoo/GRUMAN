import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    // Inicializar el BehaviorSubject con el usuario actual del localStorage
    const currentUser = this.getItem('currentUser');
    if (currentUser) {
      this.userSubject.next(currentUser);
    }
  }

  setItem(key: string, value: any): void {
    // Guardar en localStorage
    localStorage.setItem(key, JSON.stringify(value));
    
    // Si es el currentUser, actualizar el BehaviorSubject
    if (key === 'currentUser') {
      this.userSubject.next(value);
    }
  }

  getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
    if (key === 'currentUser') {
      this.userSubject.next(null);
    }
  }

  clear(): void {
    localStorage.clear();
    this.userSubject.next(null);
  }

  updateUser(user: any): void {
    // Actualizar tanto el localStorage como el BehaviorSubject
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
    console.log('Usuario actualizado en Storage Service:', user); // Para debugging
  }

  getCurrentUser(): any {
    return this.userSubject.value;
  }

  getCurrentUserWithCompany(): any {
    const user = this.getItem('currentUser');
    if (user && user.selectedCompany) {
      return user;
    }
    return null;
  }
} 