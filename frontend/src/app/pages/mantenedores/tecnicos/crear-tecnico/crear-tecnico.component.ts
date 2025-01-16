import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';
import { CommonModule, Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-crear-tecnico',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, CommonModule, MatIcon],
  templateUrl: './crear-tecnico.component.html',
  styleUrls: ['./crear-tecnico.component.scss']
})
export class CrearTecnicoComponent implements OnInit {
  form: FormGroup;
  especialidadesList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearTecnicoComponent>,
    private tecnicosService: TecnicosService,
    private especialidadService: EspecialidadesService,
    private location: Location,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      especialidades: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.cargarEspecialidades();
  }

  cargarEspecialidades() {
    this.especialidadService.findAll().subscribe({
      next: (especialidades) => {
        this.especialidadesList = especialidades;
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const tecnicoData = {
        ...this.form.value,
        especialidades: this.form.get('especialidades')?.value
      };
      Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Estás seguro de que los datos ingresados son correctos?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.tecnicosService.createTecnico(tecnicoData).subscribe(
            () => {
              Swal.fire('Éxito', 'Técnico creado exitosamente', 'success');
              this.dialogRef.close(true);
            },
            (error) => {
              Swal.fire('Error', 'Hubo un problema al crear el técnico', 'error');
            }
          );
        }
      });
    } else {
      Swal.fire('Error', 'Por favor, complete todos los campos correctamente', 'error');
    }
  }

  onCancel() {
    this.router.navigate(['/mantenedores/usuarios']);
  }

  volver() {
    this.router.navigate(['/mantenedores/usuarios']);
  }
}
