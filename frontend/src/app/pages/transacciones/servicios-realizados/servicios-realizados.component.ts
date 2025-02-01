import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { ServiciosRealizadosService } from 'src/app/services/servicios-realizados.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { StorageService } from 'src/app/services/storage.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-servicios-realizados',
  standalone: true,
  imports: [  
    CommonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule,
    FormsModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatRadioModule, 
    MatButtonModule,
    MatTableModule,
    MatExpansionModule
  ],
  templateUrl: './servicios-realizados.component.html',
  styleUrls: ['./servicios-realizados.component.scss'],
  styles: [`
    .mb-4 {
      margin-bottom: 1.5rem;
    }
    .mat-mdc-card-header {
      padding: 16px 16px 0;
    }
    .mat-mdc-card-title {
      font-size: 1.25rem;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .mat-mdc-card-subtitle {
      color: rgba(0, 0, 0, 0.6);
    }
    .table-container {
      position: relative;
      min-height: 200px;
      max-height: 600px;
      overflow: auto;
    }
  `]
})
export class ServiciosRealizadosComponent implements OnInit {
  programacionForm: FormGroup;
  tiposServicio: any[] = [];
  tiposSolicitud = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'normal', nombre: 'Normal' },
    { id: 'urgente', nombre: 'Urgente' },
    { id: 'critico', nombre: 'Crítico' },
    { id: 'programado', nombre: 'Programado' }
  ];
  meses: any[] = [];
  isGruman: boolean = false;
  clientes: any[] = [];
  selectedCompany: any;
  serviciosRealizados: any[] = [];
  displayedColumns: string[] = [
    'id','local',
   
    'tipo_mantenimiento',
    'tipoServicio',
    
  
    'tecnico',
    'status',
    'observaciones' ,'fechaIngreso',
  ];
  panelOpenState = true; // Controla el estado del panel de búsqueda

  constructor(
    private fb: FormBuilder, 
    private serviciosService: ServiciosService,
    private tipoServicioService: TipoServicioService,
    private serviciosRealizadosService: ServiciosRealizadosService,
    private clientesService: ClientesService,
    private storageService: StorageService,
    private router: Router
  ) {
    const userData = this.storageService.getCurrentUserWithCompany();
    if (userData && userData.selectedCompany) {
      this.selectedCompany = userData.selectedCompany;
      this.isGruman = this.selectedCompany.nombre === 'GRUMAN';
    }

    this.initForm();
  }

  private initForm() {
    this.programacionForm = this.fb.group({
      clientId: [''],
      tipoServicio: ['todos'],
      tipo_mantenimiento: ['todos'],
      diaSeleccionadoInicio: [null],
      diaSeleccionadoTermino: [null],
      mesFacturacion: [null],
      tipoBusqueda: ['', Validators.required]
    });

    // Si no es Gruman, usar el ID de la compañía seleccionada
    if (!this.isGruman && this.selectedCompany?.id) {
      this.programacionForm.patchValue({ clientId: this.selectedCompany.id });
      this.programacionForm.get('clientId')?.disable();
      // Cargar tipos de servicio para la compañía seleccionada
      this.loadTiposServicio(this.selectedCompany.id);
    }

    // Si es Gruman, escuchar cambios en el selector de cliente
    if (this.isGruman) {
      this.programacionForm.get('clientId')?.valueChanges.subscribe(clientId => {
        if (clientId) {
          this.loadTiposServicio(clientId);
        } else {
          this.tiposServicio = [];
        }
        // Resetear el tipo de servicio cuando cambia el cliente
        this.programacionForm.get('tipoServicio')?.reset();
      });
    }

    this.programacionForm.get('tipoBusqueda')?.valueChanges.subscribe(value => {
      const diaInicioControl = this.programacionForm.get('diaSeleccionadoInicio');
      const diaTerminoControl = this.programacionForm.get('diaSeleccionadoTermino');
      const mesFacturacionControl = this.programacionForm.get('mesFacturacion');
      
      if (value === 'rangoFechas') {
        diaInicioControl?.setValidators([Validators.required]);
        diaTerminoControl?.setValidators([Validators.required]);
        mesFacturacionControl?.clearValidators();
        mesFacturacionControl?.setValue(null);
      } else if (value === 'mesFacturacion') {
        mesFacturacionControl?.setValidators([Validators.required]);
        diaInicioControl?.clearValidators();
        diaTerminoControl?.clearValidators();
        diaInicioControl?.setValue(null);
        diaTerminoControl?.setValue(null);
      }
      
      diaInicioControl?.updateValueAndValidity();
      diaTerminoControl?.updateValueAndValidity();
      mesFacturacionControl?.updateValueAndValidity();
    });
  }

  loadTiposServicio(clientId: number) {
    const cliente = this.clientes.find(c => c.id === clientId);
    if (cliente) {
      // Filtrar servicios activos y no eliminados
      this.tiposServicio = cliente.tipoServicio.filter(
        (servicio: any) => servicio.activo && !servicio.deleted
      );
      console.log('Tipos de servicio cargados:', this.tiposServicio);
    } else if (!this.isGruman) {
      // Si no es Gruman, buscar en la compañía seleccionada
      this.tiposServicio = this.selectedCompany.tipoServicio?.filter(
        (servicio: any) => servicio.activo && !servicio.deleted
      ) || [];
    }
  }

  fechaTerminoMayorQueInicio(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('diaSeleccionadoInicio')?.value;
    const termino = control.get('diaSeleccionadoTermino')?.value;

    if (inicio && termino && termino < inicio) {
      return { fechaTerminoMayorQueInicio: true };
    }
    return null;
  }

  ngOnInit(): void {
    if (this.isGruman) {
      this.loadClientes();
    } else {
      this.loadTiposServicio(this.selectedCompany.id);
    }
    
  
    this.getMeses();
  }

  loadClientes() {
    this.clientesService.getClientes().subscribe({
      next: (clientes: any[]) => {
        this.clientes = clientes;
        console.log('Clientes cargados:', this.clientes.length);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = [];
      }
    });
  }

  onSubmit() {
    if (this.programacionForm.invalid) {
      return;
    }

    const formData = this.programacionForm.value;
    const params: any = {
      tipoBusqueda: formData.tipoBusqueda,
      clientId: this.isGruman ? formData.clientId : this.selectedCompany.id
    };

    // Agregar parámetros opcionales solo si tienen un valor diferente a 'todos'
    if (formData.tipoServicio && formData.tipoServicio !== 'todos') {
      params.tipoServicio = formData.tipoServicio;
    }

    if (formData.tipo_mantenimiento && formData.tipo_mantenimiento !== 'todos') {
      params.tipo_mantenimiento = formData.tipo_mantenimiento;
    }

    if (formData.tipoBusqueda === 'rangoFechas') {
      if (formData.diaSeleccionadoInicio) {
        params.fechaInicio = this.formatDate(formData.diaSeleccionadoInicio);
      }
      if (formData.diaSeleccionadoTermino) {
        params.fechaFin = this.formatDate(formData.diaSeleccionadoTermino);
      }
    } else if (formData.tipoBusqueda === 'mesFacturacion' && formData.mesFacturacion) {
      params.mesFacturacion = formData.mesFacturacion;
    }

    console.log('[Component] Calling service with params:', params);
    this.serviciosRealizadosService.getAll(params).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.serviciosRealizados = response.data;
          this.panelOpenState = false; // Cierra el panel después de la búsqueda
          console.log('[Component] Servicios realizados:', this.serviciosRealizados);
        }
      },
      error: (error) => console.error('[Component] Error:', error)
    });
  }

  getMeses() {
    const fechaActual = new Date();
    const fecha10AnosAtras = new Date(fechaActual.getFullYear() - 10, fechaActual.getMonth(), 1);
    const meses = [];
    const iterador = new Date(fechaActual.getTime());
    while (iterador >= fecha10AnosAtras) {
        const nombreMes = iterador.toLocaleString('default', { month: 'long' });
        const año = iterador.getFullYear();
        meses.push({ 
            nombre: `${nombreMes} ${año}`,  // Ejemplo: "febrero 2025"
            valor: `${nombreMes} ${año}`    // Usamos el mismo formato para el valor
        });
        iterador.setMonth(iterador.getMonth() - 1);
    }
    this.meses = meses;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL');
  }

  private checkIfGruman(): boolean {
    if (!this.selectedCompany || !this.selectedCompany.nombre) {
        return false;
    }
    const companyName = this.selectedCompany.nombre.trim().toUpperCase();
    const isGruman = companyName === 'GRUMAN';
    console.log('Company name:', companyName);
    console.log('Is Gruman check:', isGruman);
    return isGruman;
  }
}
