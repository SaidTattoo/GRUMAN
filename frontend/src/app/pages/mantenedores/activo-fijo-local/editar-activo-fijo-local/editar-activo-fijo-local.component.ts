import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivoFijoLocalService } from 'src/app/services/activo-fijo-local.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import { TipoActivoService } from 'src/app/services/tipo-activo.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-editar-activo-fijo-local',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatOptionModule],

  templateUrl: './editar-activo-fijo-local.component.html',
  styleUrl: './editar-activo-fijo-local.component.scss'
})
export class EditarActivoFijoLocalComponent {
  form: FormGroup;
  clientes: any[] = [];
  locales: any[] = [];
  tipoActivo: any[] = [];
  onOffInverter: any[] = ['On-off', 'Inverter'];
  constructor(private fb: FormBuilder, private router: Router, private clienteService: ClientesService, private localesService: LocalesService, private tipoActivoService: TipoActivoService, private activoFijoLocalService: ActivoFijoLocalService, private route: ActivatedRoute) {
    this.form = this.fb.group({
      client: ['', Validators.required],
      locales: ['', Validators.required],
      tipoActivo: ['', Validators.required],
      tipo_equipo: ['', Validators.required],
      marca: ['', Validators.required],
      potencia_equipo: ['', Validators.required],
      refrigerante: ['', Validators.required],
      on_off_inverter: ['', Validators.required],
      suministra: ['', Validators.required],
      codigo_activo: ['', Validators.required],
    });
  }


  ngOnInit(): void {
    this.activoFijoLocalService.getById(this.route.snapshot.params['id']).subscribe(data => {
      // Procesar los datos antes de asignarlos al formulario
      const formValues = {
        ...data,
        client: data.client?.id, // Asegúrate de asignar solo el ID del cliente
        locales: data.locales?.id, // Asegúrate de asignar solo el ID del local
        tipoActivo: data.tipoActivo?.id, // Asegúrate de asignar solo el ID del tipo de activo
        on_off_inverter: this.onOffInverter.find(option => option === data.on_off_inverter) || null // Validar el valor del dropdown
      };
      this.form.patchValue(formValues); // Asigna los valores procesados
    });
  
    this.getClientes();
    this.getTipoActivo();
  
    // Escucha cambios en el cliente para actualizar los locales
    this.form.get('client')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.getLocales(clientId);
      }
    });
  }

  onSubmit() {
    console.log(this.form.value);
    this.activoFijoLocalService.crear(this.form.value).subscribe(data => {
      Swal.fire({
        title: 'Activo fijo local creado',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/mantenedores/activo-fijo-local']);
      });
    });
  }

  onCancel() {
    this.router.navigate(['/mantenedores/activo-fijo-local']);
  }

  getClientes() {
    this.clienteService.getClientes().subscribe(data => {
      /* devolver clientes pero no incluir GRUMAN */
      const clientes = data.filter(cliente => cliente.id !== 5);
      this.clientes = clientes;
    });
  }
  getLocales(clientId: number): void {
    this.localesService.getLocalesByCliente(clientId).subscribe({
      next: (data: any) => {
        this.locales = data;
        console.log('Locales:', this.locales); // Verifica que los locales se cargan correctamente
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los locales' });
      }
    });
  }

  getTipoActivo() {
    this.tipoActivoService.getTiposActivo().subscribe(data => {
      this.tipoActivo = data;
    });
  }


}
