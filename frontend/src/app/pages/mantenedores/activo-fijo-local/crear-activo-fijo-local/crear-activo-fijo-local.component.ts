import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Router } from "@angular/router";
import { ActivoFijoLocalService } from "src/app/services/activo-fijo-local.service";
import { ClientesService } from "src/app/services/clientes.service";
import { LocalesService } from "src/app/services/locales.service";
import { TipoActivoService } from "src/app/services/tipo-activo.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-crear-activo-fijo-local',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatOptionModule],
  templateUrl: './crear-activo-fijo-local.component.html',
  styleUrl: './crear-activo-fijo-local.component.scss'
})
export class CrearActivoFijoLocalComponent implements OnInit {
  form: FormGroup;
  clientes: any[] = [];
  locales: any[] = [];
  tipoActivo: any[] = [];
  onOffInverter: any[] = ['On-off', 'Inverter'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clienteService: ClientesService,
    private localesService: LocalesService,
    private tipoActivoService: TipoActivoService,
    private activoFijoLocalService: ActivoFijoLocalService
  ) {
    this.form = this.fb.group({
      client: ['', Validators.required],
      locales: [{ value: '', disabled: true }, Validators.required],
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
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  private loadInitialData(): void {
    this.getClientes();
    this.getTipoActivo();
  }

  private setupFormSubscriptions(): void {
    this.form.get('client')?.valueChanges.subscribe((clientId:any) => {
      if (clientId) {
        this.form.get('locales')?.enable();
        this.getLocales(clientId);
      } else {
        this.form.get('locales')?.disable();
        this.locales = [];
      }
    });
  }

  getClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data: any) => {
        this.clientes = data.filter((cliente: any) => cliente.id !== 5 && cliente.nombre.toLowerCase() !== 'gruman');
        //console.log('Clientes:', this.clientes); // Verifica que los clientes se cargan correctamente
        if (this.clientes.length === 1) {
          const singleClient = this.clientes[0];
          this.form.get('client')?.setValue(singleClient.id);
          this.form.get('client')?.disable();
          this.getLocales(singleClient.id);
        }
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los clientes' });
      }
    });
  }
  
  getLocales(clientId: number): void {
    this.localesService.getLocalesByCliente(clientId).subscribe({
      next: (data: any) => {
        this.locales = data;
        //console.log('Locales:', this.locales); // Verifica que los locales se cargan correctamente
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los locales' });
      }
    });
  }
  
  getTipoActivo(): void {
    this.tipoActivoService.getTiposActivo().subscribe({
      next: (data: any) => {
        this.tipoActivo = data;
        //console.log('Tipos de Activo:', this.tipoActivo); // Verifica que los tipos de activo se cargan correctamente
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los tipos de activo' });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Por favor complete todos los campos requeridos' });
      return;
    }

    this.activoFijoLocalService.crear(this.form.value).subscribe({
      next: () => {
        Swal.fire({ title: 'Activo fijo local creado', icon: 'success', confirmButtonText: 'Aceptar' })
          .then(() => this.router.navigate(['/mantenedores/activo-fijo-local']));
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el activo fijo local' });
      }
    });
  }
  onCancel(): void {
    this.router.navigate(['/mantenedores/activo-fijo-local']);
  }
}