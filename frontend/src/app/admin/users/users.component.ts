import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';
import Swal from 'sweetalert2';
import { EditUserModalComponent } from './components/edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatFormFieldModule, CommonModule, MatInputModule, MatMenuModule, MatIconModule, MatButtonModule, MatTooltipModule, MatPaginatorModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'empresa', 'profile', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private userService: UsersService, public dialog: MatDialog, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const profile = this.authService.getUserProfile();
    if (profile && profile.profile === 'admin') {
      this.userService.getUsers(profile.company).subscribe((users: any[]) => {
        this.dataSource.data = users;
      });
    } else {
      this.userService.getUsers().subscribe((users: any[]) => {
        this.dataSource.data = users;
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  trackByUserId(index: number, user: any): number {
    return user.id;
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(EditUserModalComponent, {
      width: '300px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser({ ...user, ...result }).subscribe(() => {
          this.loadUsers(); // Recargar la lista de usuarios
        });
      }
    });
  }

  deleteUser(user: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, eliminar!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.loadUsers(); // Recargar la lista de usuarios
        });
      }
    });
  }
}

