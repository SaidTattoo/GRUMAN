import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/config';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-causa-raiz',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-causa-raiz.component.html',
  styleUrls: ['./crear-causa-raiz.component.scss']
})
export class CrearCausaRaizComponent implements OnInit {
  causaRaizForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.causaRaizForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  onSubmit(): void {
    if (this.causaRaizForm.invalid) {
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas crear esta nueva causa raíz?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.http.post(`${environment.apiUrl}causas-raiz`, this.causaRaizForm.value)
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Creado!',
                'La causa raíz ha sido creada correctamente.',
                'success'
              );
              this.router.navigate(['/mantenedores/causa-raiz']);
            },
            error: (error) => {
              console.error('Error al crear causa raíz:', error);
              
              let errorMessage = 'Error al crear causa raíz';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.status === 409) {
                errorMessage = 'Ya existe una causa raíz con este nombre';
              }
              
              Swal.fire(
                'Error',
                errorMessage,
                'error'
              );
              this.loading = false;
            },
            complete: () => {
              this.loading = false;
            }
          });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mantenedores/causa-raiz']);
  }
} 