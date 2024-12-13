import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-especialidad',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-especialidad.component.html',
  styleUrls: ['./crear-especialidad.component.scss']
})
export class CrearEspecialidadComponent {
  especialidadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private especialidadesService: EspecialidadesService,
    private router: Router
  ) {
    this.especialidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  onSubmit() {
    if (this.especialidadForm.invalid) {
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas crear esta especialidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.especialidadesService.create(this.especialidadForm.value).subscribe({
          next: () => {
            Swal.fire({
              title: 'Éxito',
              text: 'Especialidad creada correctamente',
              icon: 'success'
            }).then(() => {
              this.router.navigate(['/mantenedores/especialidades']);
            });
          },
          error: (error) => {
            console.error('Error al crear especialidad:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo crear la especialidad',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  volver() {
    this.router.navigate(['/mantenedores/especialidades']);
  }
}
