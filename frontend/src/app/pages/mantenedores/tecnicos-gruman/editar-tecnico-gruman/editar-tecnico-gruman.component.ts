import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editar-tecnico-gruman',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule,CommonModule, ],

  templateUrl: './editar-tecnico-gruman.component.html',
  styleUrl: './editar-tecnico-gruman.component.scss'
})
export class EditarTecnicoGrumanComponent {
  tecnicoForm: FormGroup;
  especialidades: any[] = [];
  idClient: number = 0;
  tecnicoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private especialidadService: EspecialidadesService,
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private userServices: TecnicosService  ) {
    this.tecnicoForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      /* password: ['', Validators.required],
      confirmPassword: ['', Validators.required], */
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
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.tecnicoId = +params['id'];
        this.cargarDatosTecnico(this.tecnicoId);
      }
    });
  }

  cargarEspecialidades() {
    this.especialidadService.findAll().subscribe((especialidades: any) => {
      this.especialidades = especialidades;
    });
  }
  findIdClientByName(name: string) {
    this.clientesService.findIdClientByName(name).subscribe((id: any) => {
      this.idClient = id;
    });
  }
  cargarDatosTecnico(id: number) {
    this.userServices.getTecnico(id).subscribe({
      next: (tecnico: any) => {
        this.tecnicoForm.patchValue({
          name: tecnico.name,
          lastName: tecnico.lastName,
          email: tecnico.email,
          rut: tecnico.rut,
          especialidades: tecnico.especialidades.map((esp: any) => esp.id),
        });
        
     /*    this.tecnicoForm.get('password')?.clearValidators();
        this.tecnicoForm.get('confirmPassword')?.clearValidators(); */
        this.tecnicoForm.get('password')?.updateValueAndValidity();
        this.tecnicoForm.get('confirmPassword')?.updateValueAndValidity();
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo cargar los datos del técnico', 'error');
      }
    });
  }
  onSubmit() {
    if (this.tecnicoForm.valid) {
      const mensaje = this.tecnicoId ? '¿Deseas actualizar el técnico?' : '¿Deseas crear un nuevo técnico?';
      
      Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.tecnicoId ? 'Actualizar' : 'Crear',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const userData = {
            ...this.tecnicoForm.value,
            clientId: this.idClient
          };
          delete userData.confirmPassword;

          if (!userData.password) {
            delete userData.password;
          }

          const action = this.tecnicoId 
            ? this.userServices.updateTecnicoGruman(this.tecnicoId, userData)
            : this.userServices.createTecnico(userData);

          action.subscribe({
            next: (response: any) => {
              Swal.fire('Éxito', `Técnico ${this.tecnicoId ? 'actualizado' : 'creado'} correctamente`, 'success');
              this.router.navigate(['/mantenedores/tecnicos-gruman']);
            },
            error: (error: any) => {
              Swal.fire('Error', `No se pudo ${this.tecnicoId ? 'actualizar' : 'crear'} el técnico`, 'error');
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
