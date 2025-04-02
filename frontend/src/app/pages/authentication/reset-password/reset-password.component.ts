import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="authentication">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
              <div class="card">
                <div class="card-body">
                  <div class="text-center">
                    <h2 class="mb-3">Restablecer Contraseña</h2>
                    <p class="text-muted">Ingresa tu nueva contraseña</p>
                  </div>

                  <form [formGroup]="form" (ngSubmit)="submit()">
                    <mat-form-field class="w-100" appearance="outline">
                      <mat-label>Nueva Contraseña</mat-label>
                      <input
                        matInput
                        [type]="hidePassword ? 'password' : 'text'"
                        formControlName="password"
                      />
                      <button
                        mat-icon-button
                        matSuffix
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="'Hide password'"
                        [attr.aria-pressed]="hidePassword"
                      >
                        <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="f.password.errors?.['required']">La contraseña es requerida</mat-error>
                      <mat-error *ngIf="f.password.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</mat-error>
                    </mat-form-field>

                    <mat-form-field class="w-100 mt-2" appearance="outline">
                      <mat-label>Confirmar Contraseña</mat-label>
                      <input
                        matInput
                        [type]="hideConfirmPassword ? 'password' : 'text'"
                        formControlName="confirmPassword"
                      />
                      <button
                        mat-icon-button
                        matSuffix
                        (click)="hideConfirmPassword = !hideConfirmPassword"
                        [attr.aria-label]="'Hide password'"
                        [attr.aria-pressed]="hideConfirmPassword"
                      >
                        <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                      </button>
                      <mat-error *ngIf="f.confirmPassword.errors?.['required']">Confirma tu contraseña</mat-error>
                      <mat-error *ngIf="f.confirmPassword.errors?.['passwordMismatch']">Las contraseñas no coinciden</mat-error>
                    </mat-form-field>

                    <div class="d-flex justify-content-center mt-3">
                      <button
                        mat-flat-button
                        color="primary"
                        class="w-100"
                        type="submit"
                        [disabled]="form.invalid || isLoading"
                      >
                        <mat-icon *ngIf="isLoading" class="me-2">
                          <mat-spinner diameter="20"></mat-spinner>
                        </mat-icon>
                        Cambiar Contraseña
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100vh;
      background-color: #f6f9fc;
      display: flex;
      align-items: center;
    }
    .authentication {
      width: 100%;
      padding: 20px;
    }
    .card {
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card-body {
      padding: 30px;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  options = this.settings.getOptions();
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string = '';

  form = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ])
  });

  constructor(
    private settings: CoreService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.snackBar.open('Token de recuperación no válido', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.router.navigate(['/authentication/login']);
      }
    });

    // Validador personalizado para confirmar contraseña
    this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
      if (this.form.get('password')?.value !== this.form.get('confirmPassword')?.value) {
        this.form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      const newPassword = this.form.get('password')?.value || '';

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Contraseña actualizada exitosamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/authentication/login']);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al restablecer la contraseña';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
    }
  }
} 