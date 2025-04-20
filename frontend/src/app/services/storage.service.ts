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
    
    // Check for stored company ID and ensure it's reflected in the current user
    this.syncSelectedCompany();
  }
  
  // Sincroniza el ID de la compañía seleccionada con el objeto de usuario
  private syncSelectedCompany(): void {
    const currentUser = this.getItem('currentUser');
    const storedCompanyId = this.getItem('selectedCompanyId');
    
    if (currentUser && storedCompanyId && currentUser.companies) {
      const selectedCompany = currentUser.companies.find(
        (company: any) => company.id.toString() === storedCompanyId.toString()
      );
      
      if (selectedCompany && (!currentUser.selectedCompany || currentUser.selectedCompany.id.toString() !== storedCompanyId.toString())) {
        console.log('Syncing stored company ID with user object:', selectedCompany.nombre);
        currentUser.selectedCompany = selectedCompany;
        this.setItem('currentUser', currentUser);
        this.userSubject.next(currentUser);
      }
    }
  }

  // Método para emitir un evento cuando cambia la empresa seleccionada
  emitCompanyChangeEvent(company: any): void {
    console.log('Emitting company change event:', company.nombre);
    this.companyChangeSubject.next(company);
  }

  setItem(key: string, value: any): void {
    try {
      // Convert the value to a JSON string
      const jsonValue = JSON.stringify(value);
      // Store it
      localStorage.setItem(key, jsonValue);
      
      // If we're updating the current user, also update the subject
      if (key === 'currentUser') {
        this.userSubject.next(value);
      }
      
      // If we're setting a selected company ID, ensure it matches the user object
      if (key === 'selectedCompanyId') {
        this.syncSelectedCompany();
      }
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  getItem(key: string): any {
    try {
      // Get the value from storage
      const value = localStorage.getItem(key);
      // If it exists, parse and return it
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving from localStorage', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      
      // If we're removing the current user, update the subject
      if (key === 'currentUser') {
        this.userSubject.next(null);
      }
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  updateUser(user: any): void {
    this.setItem('currentUser', user);
    this.userSubject.next(user);
    
    // If the user has a selected company, ensure the selectedCompanyId is in sync
    if (user && user.selectedCompany) {
      this.setItem('selectedCompanyId', user.selectedCompany.id.toString());
    }
  }

  getCurrentUser(): any {
    return this.getItem('currentUser');
  }

  getCurrentUserWithCompany(): any {
    const user = this.getItem('currentUser');
    if (user) {
      // If user has no selected company but we have a stored company ID, try to set it
      if (!user.selectedCompany && user.companies && user.companies.length > 0) {
        const storedCompanyId = this.getItem('selectedCompanyId');
        
        if (storedCompanyId) {
          const company = user.companies.find((c: any) => c.id.toString() === storedCompanyId.toString());
          if (company) {
            user.selectedCompany = company;
            // Update storage and emit the change
            this.updateUser(user);
            this.emitCompanyChangeEvent(company);
          }
        }
      }
      return user;
    }
    return null;
  }
} 