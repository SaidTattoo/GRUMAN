import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <div class="form-container">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico para recibir las instrucciones de recuperación.</p>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput type="email" formControlName="email" placeholder="ejemplo@correo.com">
            <mat-error *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">
              El correo electrónico es requerido
            </mat-error>
            <mat-error *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">
              Ingresa un correo electrónico válido
            </mat-error>
          </mat-form-field>

          <div class="button-container">
            <button mat-button type="button" (click)="onCancel()">
              Cancelar
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="!forgotPasswordForm.valid || isLoading">
              {{ isLoading ? 'Enviando...' : 'Enviar Instrucciones' }}
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
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.snackBar.open(
            'Se han enviado las instrucciones a tu correo electrónico',
            'Cerrar',
            { duration: 5000 }
          );
          this.router.navigate(['/authentication/login']);
        },
        error: (error) => {
          this.snackBar.open(
            error.error.message || 'Error al procesar la solicitud',
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