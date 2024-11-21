import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ClientesService } from 'src/app/services/clientes.service';
import { TecnicosService } from 'src/app/services/tecnicos.service';

@Component({
  selector: 'app-cliente-usuarios',
  standalone: true,
  imports: [MatCardModule,ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './cliente-usuarios.component.html',
  styleUrl: './cliente-usuarios.component.scss'
})
export class ClienteUsuariosComponent implements OnInit {
  clienteUsuarioForm: FormGroup;
  clientes: any[] = [];
  perfiles = ['user', 'reporter', 'admin', 'superadmin'];
  
  constructor(private fb: FormBuilder, private clientesService: ClientesService, private tecnicosService: TecnicosService) {

  }
  ngOnInit(): void {
    
    this.clientesService.getClientes().subscribe((data:any) => {
      this.clientes = data;
    });

    this.clienteUsuarioForm = this.fb.group({
      clientId: ['', Validators.required],
      perfil: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rut: ['', Validators.required],
      password: ['', Validators.required],
      lastname: ['', Validators.required],
      repetirContrasena: ['', Validators.required],
    });
    console.log(this.clienteUsuarioForm.value);
  }
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('repetirContrasena')?.value
      ? null : { mismatch: true };
  }
  onSubmit() {
    const formValues = this.clienteUsuarioForm.value;
    const tecnicoData = {
      clientId: formValues.clientId,
      perfil: formValues.perfil,
      name: formValues.name,
      email: formValues.email,
      rut: formValues.rut,
      password: formValues.password,
      repetirContrasena: formValues.repetirContrasena,
      lastname: formValues.lastname,
    };
    this.tecnicosService.createTecnico(tecnicoData).subscribe({
      next: (res) => console.log('Usuario creado', res),
      error: (err) => console.error('Error al crear usuario', err),
    });
  }
}
