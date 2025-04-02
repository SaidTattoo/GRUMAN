import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <div class="form-container">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa tu nueva contraseña.</p>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Nueva Contraseña</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="resetPasswordForm.get('newPassword')?.errors?.['required']">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="resetPasswordForm.get('newPassword')?.errors?.['minlength']">
              La contraseña debe tener al menos 8 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Confirmar Contraseña</mat-label>
            <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
            <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['required']">
              La confirmación de contraseña es requerida
            </mat-error>
            <mat-error *ngIf="resetPasswordForm.hasError('mismatch')">
              Las contraseñas no coinciden
            </mat-error>
          </mat-form-field>

          <div class="button-container">
            <button mat-button type="button" (click)="onCancel()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="!resetPasswordForm.valid || isLoading">
              {{ isLoading ? 'Guardando...' : 'Guardar Nueva Contraseña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .form-container {
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h2 {
      color: #1e88e5;
      margin: 0 0 16px 0;
    }
    p {
      color: #666;
      margin-bottom: 24px;
    }
    .w-100 {
      width: 100%;
    }
    .button-container {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
    mat-form-field {
      margin-bottom: 16px;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.snackBar.open('Token no válido', 'Cerrar', { duration: 5000 });
      this.router.navigate(['/authentication/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.snackBar.open(
            'Contraseña actualizada exitosamente',
            'Cerrar',
            { duration: 5000 }
          );
          this.router.navigate(['/authentication/login']);
        },
        error: (error) => {
          this.snackBar.open(
            error.error.message || 'Error al actualizar la contraseña',
            'Cerrar',
            { duration: 5000 }
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/authentication/login']);
  }
} 