import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-local',
  templateUrl: './crear-local.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatSelectModule, CommonModule],
  styleUrls: ['./crear-local.component.scss']
})
export class CrearLocalComponent implements OnInit {
  localForm: FormGroup;
  clientes: any[] = [];
  constructor(
    private fb: FormBuilder,
    private localesService: LocalesService,
    private router: Router,
    private clientesService: ClientesService
  ) { }

  ngOnInit(): void {
    this.localForm = this.fb.group({
      direccion: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required],
      cliente: ['', Validators.required],
      zona: ['', Validators.required],
      grupo: ['', Validators.required],
      referencia: ['', Validators.required],
      telefono: ['', Validators.required],
      email_local: ['', [Validators.required, Validators.email]],
      email_encargado: ['', [Validators.required, Validators.email]],
      nombre_encargado: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      numeroLocal: ['', Validators.required]
    });
    this.getClientes();
  }


  getClientes() {
    this.clientesService.getClientes().subscribe((data) => {
      console.log('****', data);
      this.clientes = data;
    });
  }
  onSubmit() {
    //generar numero de local DOS primeras letras del cliente - 4 digitos finales del timestamp
    //obtener nombre del cliente seleccionado
    let nombreCliente = this.clientes.find(cliente => cliente.id === this.localForm.get('cliente')?.value)?.nombre;
    const palabrasExcluidas = ['y', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'con', 'para'];


    //en caso que sea ejemplo Rotter y Kraus el nombre del cliente debe ser RK
    // puede ser cualquier nombre ejemplo: Rotter y Kraus, se debe obtener el nombre del cliente y quedarse con las dos primeras letras Ro&Kr esto no, deberia ser RK
    //ejemplo 2: Rotter y Asociados, se debe obtener el nombre del cliente y quedarse con las dos primeras letras Ro&As esto no, deberia ser RA
    //ejemplo 3: Rotter y Cia, se debe obtener el nombre del cliente y quedarse con las dos primeras letras Ro&Ci esto no, deberia ser RC
    //ejemplo 4: Rotter y Cia Ltda, se debe obtener el nombre del cliente y quedarse con las dos primeras letras Ro&Ci esto no, deberia ser RC
    if (nombreCliente) {
      // Divide el nombre en palabras y filtra las palabras excluidas
      const palabras = nombreCliente.split(' ').filter((palabra: string) => !palabrasExcluidas.includes(palabra.toLowerCase()));

      // Toma las iniciales de las palabras restantes
      nombreCliente = palabras.map((palabra: string) => palabra.charAt(0).toUpperCase()).join('');
    }



    const timestamp = Date.now().toString();
    console.log('****', nombreCliente + '-' + timestamp);
    const numeroLocal = `${nombreCliente}-${timestamp}`;
   // const numeroLocal = `${this.localForm.get('cliente')?.value.slice(0, 2)}-${timestamp}`;
    this.localForm.get('numeroLocal')?.setValue(numeroLocal);
    console.log('****', this.localForm.value);
    //agregar el numero de local al formulario
    this.localForm.get('numeroLocal')?.setValue(numeroLocal);

    if (this.localForm.valid) {
      Swal.fire({
        title: '¿Estás seguro que deseas crear este local?',
        text: 'Por favor, espere...',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: 'Sí, crear',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(this.localForm.value);
          this.localesService.crearLocal(this.localForm.value).subscribe((data) => {
            console.log('****', data);
            //cerrar modal
            this.router.navigate(['/mantenedores/locales']);
          });
        }
      });
    }

  }
  onClienteChange(event: any) {
    const clienteId = event.value;
    console.log('Cliente seleccionado:', clienteId);
    let nombreCliente = this.clientes.find(cliente => cliente.id === this.localForm.get('cliente')?.value)?.nombre;
    const palabrasExcluidas = ['y', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'en', 'por', 'con', 'para'];
    if (nombreCliente) {
      // Divide el nombre en palabras y filtra las palabras excluidas
      const palabras = nombreCliente.split(' ').filter((palabra: string) => !palabrasExcluidas.includes(palabra.toLowerCase()));

      // Toma las iniciales de las palabras restantes
      nombreCliente = palabras.map((palabra: string) => palabra.charAt(0).toUpperCase()).join('');
    }


    console.log('****', nombreCliente );
    // Aquí puedes realizar acciones adicionales, como actualizar otros campos del formulario
  }
}
