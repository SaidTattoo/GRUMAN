import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { ServiciosRealizadosService } from 'src/app/services/servicios-realizados.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { StorageService } from 'src/app/services/storage.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FacturacionService } from 'src/app/services/facturacion.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servicios-realizados',
  standalone: true,
  imports: [  
    RouterModule,
    MatIconModule,
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
    MatExpansionModule,
    MatTooltipModule,
    DatePipe
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
    'id',
    'fechaIngreso',
    'local',
    'tipo_mantenimiento',
    'tipoServicio',
    'tecnico',
    'status',
    'fechaValidacion',
    'observaciones',
    'acciones'
  ];
  panelOpenState = true; // Controla el estado del panel de búsqueda

  constructor(
    private fb: FormBuilder, 
    private serviciosService: ServiciosService,
    private tipoServicioService: TipoServicioService,
    private serviciosRealizadosService: ServiciosRealizadosService,
    private clientesService: ClientesService,
    private storageService: StorageService,
    private router: Router,
    private facturacionService: FacturacionService
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
      tipoServicio: [null],
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
        this.programacionForm.get('tipoServicio')?.setValue(null);
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
      ).map((servicio: any) => ({
        id: servicio.id,
        nombre: servicio.nombre_servicio || servicio.nombre // Fallback to nombre if nombre_servicio doesn't exist
      }));
      console.log('Tipos de servicio cargados:', this.tiposServicio);
    } else if (!this.isGruman) {
      // Si no es Gruman, buscar en la compañía seleccionada
      this.tiposServicio = this.selectedCompany.tipoServicio?.filter(
        (servicio: any) => servicio.activo && !servicio.deleted
      ).map((servicio: any) => ({
        id: servicio.id,
        nombre: servicio.nombre_servicio || servicio.nombre
      })) || [];
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
    console.log('Obteniendo meses de facturación...');
    
    // Intentar obtener meses desde la API
    this.facturacionService.obtenerMesesUnicos().subscribe((data: any) => {
      this.meses = data;
      console.log('Meses', this.meses);
    });
  }

  // Método para generar meses a partir de un rango de fechas si la API falla
  generarMesesDesdeRango() {
    console.log('Generando meses localmente...');
    const fechaActual = new Date();
    // Generar meses desde 2025 hasta 2026 para mantener el mismo formato que los datos existentes
    const meses = [
      'Enero 2025', 'Febrero 2025', 'Marzo 2025', 'Abril 2025', 'Mayo 2025',
      'Junio 2025', 'Julio 2025', 'Agosto 2025', 'Septiembre 2025',
      'Octubre 2025', 'Noviembre 2025', 'Diciembre 2025',
      'Enero 2026', 'Febrero 2026', 'Marzo 2026', 'Abril 2026', 'Mayo 2026'
    ];
    
    this.meses = meses;
    console.log('Meses generados localmente:', this.meses);
  }

  formatDate(date: string): string {
    if (!date) return '';
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

  verDetalle(servicio: any): void {
    // Crear la URL usando el router
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/transacciones/servicios-realizados', servicio.id])
    );
    // Abrir en una nueva pestaña
    window.open(url, '_blank');
  }

  exportarExcel(): void {
    if (!this.serviciosRealizados || this.serviciosRealizados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar a Excel'
      });
      return;
    }

    // Preparar los datos para la exportación
    const datosParaExportar = this.serviciosRealizados.map(servicio => ({
      'Número de Solicitud': servicio.id,
      'Cliente': servicio.client?.nombre || 'No asignado',
      'Local': servicio.local?.nombre_local || 'No asignado',
      'Fecha de Visita': this.formatDate(servicio.fechaVisita),
      'Tipo de Servicio': servicio.tipoServicio?.nombre || 'No especificado',
      'Técnico': servicio.tecnico_asignado ? `${servicio.tecnico_asignado.name} ${servicio.tecnico_asignado.lastName}` : 'No asignado',
      'Técnico 2': servicio.tecnico_asignado_2 ? `${servicio.tecnico_asignado_2.name} ${servicio.tecnico_asignado_2.lastName}` : 'No asignado',
      'Tipo Mantenimiento': servicio.tipo_mantenimiento || 'No especificado',
      'Estado': servicio.status || 'No definido',
      'Mes Facturación': servicio.facturacion?.mes || 'No asignado',
      'Observaciones': servicio.observaciones || 'Sin observaciones'
    }));

    // Crear el libro de trabajo y la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 10 },  // Número de Solicitud
      { wch: 30 },  // Cliente
      { wch: 30 },  // Local
      { wch: 15 },  // Fecha de Visita
      { wch: 25 },  // Tipo de Servicio
      { wch: 30 },  // Técnico
      { wch: 30 },  // Técnico 2
      { wch: 20 },  // Tipo Mantenimiento
      { wch: 15 },  // Estado
      { wch: 20 },  // Mes Facturación
      { wch: 50 }   // Observaciones
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Servicios Realizados');

    // Generar el archivo y descargarlo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Servicios_Realizados_${fechaActual}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'Exportación exitosa',
      text: 'El archivo Excel se ha descargado correctamente',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
