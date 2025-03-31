import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Cambiar Contraseña</h2>
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <div mat-dialog-content class="dialog-content">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Nueva Contraseña</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="passwordForm.get('newPassword')?.errors?.['required']">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">
              La contraseña debe tener al menos 8 caracteres
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Confirmar Nueva Contraseña</mat-label>
            <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
            <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">
              La confirmación de contraseña es requerida
            </mat-error>
            <mat-error *ngIf="passwordForm.hasError('mismatch')">
              Las contraseñas no coinciden
            </mat-error>
          </mat-form-field>
        </div>
        
        <div mat-dialog-actions align="end" class="dialog-actions">
          <button mat-button (click)="onCancel()" class="cancel-button">
            Cancelar
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="!passwordForm.valid">
            Guardar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      min-width: 400px;
    }
    .dialog-title {
      margin: 0 0 20px 0;
      color: #1e88e5;
      font-size: 24px;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .w-100 {
      width: 100%;
    }
    .dialog-actions {
      margin: 24px -24px -24px -24px;
      padding: 16px 24px;
      background-color: #f5f5f5;
    }
    .cancel-button {
      margin-right: 8px;
    }
    mat-form-field {
      margin-bottom: 16px;
    }
  `]
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private storageService: StorageService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const currentUser = this.storageService.getCurrentUser();
      console.log('Usuario ID:', currentUser?.id);
      
      if (currentUser?.id) {
        this.authService.changePassword(currentUser.id, this.passwordForm.get('newPassword')?.value)
          .subscribe({
            next: (response) => {
              this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Error al cambiar la contraseña:', error);
              this.snackBar.open('Error al cambiar la contraseña', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });
            }
          });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 