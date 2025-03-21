import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ClientesService } from 'src/app/services/clientes.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
@Component({
  selector: 'app-cliente-usuarios',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatCardModule,   MatListModule, MatFormFieldModule, FormsModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './cliente-usuarios.component.html',
  styleUrl: './cliente-usuarios.component.scss',
  styles: [`
    .client-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .client-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .client-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .client-item img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin-bottom: 10px;
    }

    .client-name {
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      margin-top: 10px;
      color: #333;
    }

    .selected {
      background-color: #e3f2fd;
      border: 2px solid #1e88e5;
    }
  `]
})
export class ClienteUsuariosComponent implements OnInit {
  clienteUsuarioForm: FormGroup;
  clientes: any[] = [];
  perfiles = ['user', 'reporter', 'admin', 'superadmin'];
  selectedClientIds: number[] = [];
  
  hasMinLength = false;
  hasNumber = false;
  hasSpecialChar = false;
  hasUpperCase = false;
  hasLowerCase = false;

  

  constructor(private fb: FormBuilder, private clientesService: ClientesService, private tecnicosService: TecnicosService, private router: Router) {

  }
  ngOnInit(): void {
    


    this.clientesService.getClientesWithGruman().subscribe((data:any) => {
      this.clientes = data;
    });

    this.clienteUsuarioForm = this.fb.group({
      perfil: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', Validators.required],
      password: ['', Validators.required],
      lastName: ['', Validators.required],
      repetirContrasena: ['', Validators.required],
      especialidades: [[]],
    }, { validators: this.passwordMatchValidator });
    //console.log(this.clienteUsuarioForm.value);
  }


  
  toggleClientSelection(clienteId: number): void {
    const index = this.selectedClientIds.indexOf(clienteId);
    if (index === -1) {
      this.selectedClientIds.push(clienteId);
    } else {
      this.selectedClientIds.splice(index, 1);
    }
    //console.log(this.selectedClientIds);
  }
  trackByClienteId(index: number, cliente: any): number {
    return cliente.id;
  }
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('repetirContrasena')?.value
      ? null : { mismatch: true };
  }
  onSubmit() {
    if (!this.isFormValid()) {
      console.error('Formulario inválido o sin clientes seleccionados');
      return;
    }

    // Desactivar el botón de envío para evitar múltiples clics
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
    }

    const formValues = this.clienteUsuarioForm.value;
    const tecnicoData = {
      clientId: this.selectedClientIds,
      perfil: formValues.perfil,
      name: formValues.name,
      email: formValues.email,
      rut: formValues.rut,
      password: formValues.password,
      repetirContrasena: formValues.repetirContrasena,
      lastName: formValues.lastName,
      especialidades: [],
    };

    this.tecnicosService.createTecnico(tecnicoData).subscribe({
      next: (res) => {
        //console.log('Usuario creado', res);
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario ha sido creado exitosamente.',
        });
        this.router.navigate(['/mantenedores/usuarios']);
      },
      error: (err) => {
        console.error('Error al crear usuario', err);
        if (err.statusCode === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El rut o el email ya están en uso.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error.message,
          });
        }
        // Reactivar el botón en caso de error
        if (submitButton) {
          submitButton.disabled = false;
        }
      },
    });
  }
  isFormValid(): boolean {
    return this.clienteUsuarioForm.valid && this.selectedClientIds.length > 0;
  }


  onCancel() {
    this.router.navigate(['/mantenedores/usuarios']);
  }





}
