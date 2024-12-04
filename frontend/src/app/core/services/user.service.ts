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
      this.storage.setItem('currentUser', user);
      this.currentUserSubject.next(user);
    }
  }