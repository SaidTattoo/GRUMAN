import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-boxed-forgot-password',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './boxed-forgot-password.component.html',
})
export class AppBoxedForgotPasswordComponent {
  options = this.settings.getOptions();
  isLoading = false;
  console = console; // Make console available in template

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    console.log('Submit function called');
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      const email = this.form.value.email || '';
      
      console.log('Enviando solicitud de recuperación de contraseña para:', email);
      
      // Mostrar estado de carga inmediatamente
      this.snackBar.open('Enviando solicitud...', '', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      this.authService.forgotPassword(email).subscribe({
        next: (response: any) => {
          console.log('Respuesta exitosa:', response);
          this.isLoading = false;
          this.snackBar.open('Se ha enviado un correo con las instrucciones para recuperar tu contraseña', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/authentication/boxed-login']);
        },
        error: (error: any) => {
          console.error('Error en la solicitud:', error);
          this.isLoading = false;
          let errorMessage = 'Error al procesar la solicitud';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          console.log('Mensaje de error a mostrar:', errorMessage);
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
    } else {
      console.log('Formulario inválido o ya está cargando:', {
        isValid: this.form.valid,
        isLoading: this.isLoading,
        formValue: this.form.value,
        formErrors: this.form.errors
      });
    }
  }
}
