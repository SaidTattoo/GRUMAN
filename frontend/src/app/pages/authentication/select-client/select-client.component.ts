import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-select-client',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatCardModule],
  templateUrl: './select-client.component.html',
  styleUrl: './select-client.component.scss'
})
export class SelectClientComponent implements OnInit, OnDestroy {
  user: any;
  companies: any[] = [];
  private userSub: Subscription;

  constructor(
    private router: Router,
    private storage: StorageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSub = this.storage.user$.subscribe(user => {
      this.user = user;
      this.companies = user?.companies || [];
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  selectCompany(selectedCompany: any): void {
    const currentUser = this.userService.getCurrentUser();
    const updatedUser = { ...currentUser, companies: [selectedCompany] };
    
    // Usar el método del servicio para actualizar el usuario
    this.userService.updateCurrentUser(updatedUser);
    
    this.router.navigate(['/dashboards/dashboard1']);
  }
}
