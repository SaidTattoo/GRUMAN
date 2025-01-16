import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

interface Tecnico {
  name: string;
  lastName: string;
  rut: string;
  email: string;
}

@Component({
  selector: 'app-editar-tecnico',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './editar-tecnico.component.html'
})
export class EditarTecnicoComponent implements OnInit {
  form: FormGroup;
  tecnicoId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tecnicosService: TecnicosService,
    private location: Location
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      rut: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tecnicoId = params['id'];
      this.loadTecnico();
    });
  }

  loadTecnico() {
    this.tecnicosService.getTecnico(this.tecnicoId).subscribe({
      next: (tecnico: any) => {
        this.form.patchValue({
          name: tecnico.name,
          lastName: tecnico.lastName || tecnico.lastName,
          rut: tecnico.rut,
          email: tecnico.email 
        });
      },
      error: (error) => {
        console.error('Error cargando técnico:', error);
        Swal.fire('Error', 'No se pudo cargar la información del técnico', 'error');
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      if (!formData.password) {
        delete formData.password; // No enviar password si está vacío
      }

      this.tecnicosService.updateTecnico(this.tecnicoId, formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Técnico actualizado correctamente', 'success');
          this.router.navigate(['/mantenedores/tecnicos']);
        },
        error: (error) => {
          console.error('Error actualizando técnico:', error);
          Swal.fire('Error', 'No se pudo actualizar el técnico', 'error');
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/mantenedores/trabajadores']);
  }

  volver() {
    this.router.navigate(['/mantenedores/trabajadores']);
  }
}
