import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { StorageService } from "src/app/services/storage.service";

@Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
  
    constructor(private storage: StorageService) {
      // Inicializar con el usuario actual del storage
      const user = this.storage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  
    getCurrentUser() {
      return this.currentUserSubject.value;
    }
  
    updateCurrentUser(user: any) {
      console.log('Updating current user:', user.name, 'with company:', user.selectedCompany?.nombre);
      
      // Save to storage
      this.storage.setItem('currentUser', user);
      
      // Update the subject
      this.currentUserSubject.next(user);
      
      // If there's a selected company, ensure it's also saved separately and emitted
      if (user.selectedCompany) {
        this.storage.setItem('selectedCompanyId', user.selectedCompany.id.toString());
        this.storage.emitCompanyChangeEvent(user.selectedCompany);
      }
    }
    
    // Helper method to select a company for a user
    selectCompany(company: any) {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return;
      
      const updatedUser = {
        ...currentUser,
        selectedCompany: company
      };
      
      this.updateCurrentUser(updatedUser);
    }
  }