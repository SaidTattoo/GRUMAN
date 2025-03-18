import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/config';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-causa-raiz',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './editar-causa-raiz.component.html',
  styleUrls: ['./editar-causa-raiz.component.scss']
})
export class EditarCausaRaizComponent implements OnInit {
  causaRaizForm: FormGroup;
  loading = false;
  causaRaizId: number;
  causaRaiz: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCausaRaiz();
  }

  inicializarFormulario(): void {
    this.causaRaizForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  cargarCausaRaiz(): void {
    this.causaRaizId = +this.route.snapshot.paramMap.get('id')!;
    
    this.loading = true;
    this.http.get(`${environment.apiUrl}causas-raiz/${this.causaRaizId}`)
      .subscribe({
        next: (data: any) => {
          this.causaRaiz = data;
          this.causaRaizForm.patchValue({
            nombre: data.nombre
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar causa raíz:', error);
          this.snackBar.open('Error al cargar causa raíz', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/mantenedores/causa-raiz']);
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.causaRaizForm.invalid) {
      return;
    }

    this.loading = true;
    this.http.patch(`${environment.apiUrl}causas-raiz/${this.causaRaizId}`, this.causaRaizForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Causa raíz actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/mantenedores/causa-raiz']);
        },
        error: (error) => {
          console.error('Error al actualizar causa raíz:', error);
          
          let errorMessage = 'Error al actualizar causa raíz';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'Ya existe otra causa raíz con este nombre';
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/mantenedores/causa-raiz']);
  }
} 