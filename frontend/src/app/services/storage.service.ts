import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private userSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || '{}'));

  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === 'currentUser') {
      this.userSubject.next(value);
    }
  }

  getItem(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  get user$() {
    return this.userSubject.asObservable();
  }
} 