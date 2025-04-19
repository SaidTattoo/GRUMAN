import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private companyChangeSubject = new BehaviorSubject<any>(null);
  public companyChange$: Observable<any> = this.companyChangeSubject.asObservable();
  
  // Para manejar el usuario actual
  private userSubject = new BehaviorSubject<any>(this.getItem('currentUser'));
  public user$ = this.userSubject.asObservable();

  constructor() {
    // Inicializar el BehaviorSubject con el usuario actual del localStorage
    const currentUser = this.getItem('currentUser');
    if (currentUser) {
      this.userSubject.next(currentUser);
    }
  }

  // Método para emitir un evento cuando cambia la empresa seleccionada
  emitCompanyChangeEvent(company: any): void {
    this.companyChangeSubject.next(company);
  }

  setItem(key: string, value: any): void {
    try {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
      
      // Si se actualiza el usuario, actualizamos el BehaviorSubject
      if (key === 'currentUser') {
        this.userSubject.next(value);
      }
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      try {
        // Intentar parsear como JSON, si falla devolver el string
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (e) {
      console.error('Error getting from localStorage', e);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      
      // Si se elimina el usuario, actualizamos el BehaviorSubject
      if (key === 'currentUser') {
        this.userSubject.next(null);
      }
    } catch (e) {
      console.error('Error removing from localStorage', e);
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