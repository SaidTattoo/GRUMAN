import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-especialidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './editar-especialidad.component.html',
  styleUrl: './editar-especialidad.component.scss'
})
export class EditarEspecialidadComponent implements OnInit {
  especialidadForm: FormGroup;
  submitted = false;
  id: number;

  constructor(
    private formBuilder: FormBuilder,
    private especialidadService: EspecialidadesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.especialidadForm = this.formBuilder.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarEspecialidad();
  }

  cargarEspecialidad() {
    this.especialidadService.findById(this.id).subscribe({
      next: (especialidad: any) => {
        this.especialidadForm.patchValue({
          nombre: especialidad.nombre,
          descripcion: especialidad.descripcion
        });
      },
      error: (error: any) => {
        console.error('Error al cargar la especialidad:', error);
        // Aquí podrías agregar un manejo de error más específico
      }
    });
  }

  get f() {
    return this.especialidadForm.controls;
  }

  onSubmit() {
    
    this.submitted = true;

    if (this.especialidadForm.invalid) {
      return;
    }

    const especialidadActualizada: any = {
      id: this.id,
      ...this.especialidadForm.value
    };
    Swal.fire({
      title: '¿Estás seguro?',      
      text: '¿Quieres actualizar la especialidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.especialidadService.update(this.id, especialidadActualizada).subscribe({
          next: () => {
            this.router.navigate(['/mantenedores/especialidades']);
          },
          error: (error: any) => {
            console.error('Error al actualizar la especialidad:', error);
          }
        });
      }
    });
  }

  volver() {
    this.router.navigate(['/mantenedores/especialidades']);
  }
}
