import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { MatSelectModule } from '@angular/material/select';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-tecnico-gruman',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule,CommonModule, ],
  templateUrl: './crear-tecnico-gruman.component.html',
  styleUrl: './crear-tecnico-gruman.component.scss'
})
export class CrearTecnicoGrumanComponent implements OnInit {
  tecnicoForm: FormGroup;
  especialidades: any[] = [];
  idClient: number = 0;
  constructor(
    private fb: FormBuilder,
    private especialidadService: EspecialidadesService,
    private router: Router,
    private clientesService: ClientesService,
    private userServices: TecnicosService  ) {
    this.tecnicoForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      especialidades: [[], Validators.required],
      profile: ['tecnico'],
      rut: ['', Validators.required],
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit() {
    this.cargarEspecialidades();
    this.findIdClientByName('GRUMAN');
  }

  cargarEspecialidades() {
    this.especialidadService.findAll().subscribe((especialidades: any) => {
      this.especialidades = especialidades;
    });
  }
  findIdClientByName(name: string) {
    this.clientesService.findIdClientByName(name).subscribe((id: any) => {
      this.idClient = id.id;
      console.log('idClient',this.idClient);
    });
  }
  onSubmit() {
    if (this.tecnicoForm.valid) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas crear un nuevo técnico?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const formValues = this.tecnicoForm.value;
                const userData = {
                    name: formValues.name,
                    lastName: formValues.lastName,
                    email: formValues.email,
                    password: formValues.password,
                    rut: formValues.rut,
                    profile: formValues.profile,
                    especialidades: formValues.especialidades,
                    clientId: [this.idClient]
                };

                this.userServices.createTecnico(userData).subscribe({
                    next: (response) => {
                        Swal.fire('Éxito', 'Técnico creado correctamente', 'success');
                        this.router.navigate(['/mantenedores/tecnicos-gruman']);
                    },
                    error: (error) => {
                        Swal.fire('Error', `No se pudo crear el técnico por que el <strong>Rut</strong> o el <strong>Email</strong> ya existe`, 'error');
                    }
                });
            }
        });
    }
  }
  onCancel() {
    this.router.navigate(['/mantenedores/tecnicos-gruman']);
  }

  // Validador personalizado para comparar contraseñas
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
