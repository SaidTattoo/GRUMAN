import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { navItems } from '../layouts/full/horizontal/sidebar/sidebar-data';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItemsSubject = new BehaviorSubject<any[]>(navItems);
  menuItems$ = this.menuItemsSubject.asObservable();

  constructor() {}

  updateMenuItems(items: any[]): void {
    this.menuItemsSubject.next(items);
  }
}