import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
import { SolicitarVisitaComponent } from '../solicitar-visita/solicitar-visita.component';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { TipoSolicitudService } from '../../mantenedores/tipo-solicitud/tipo-solicitud.service';

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
    DatePipe,
  ],
  templateUrl: './servicios-realizados.component.html',
  styleUrls: ['./servicios-realizados.component.scss'],
  styles: [
    `
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
      
      /* Contenedor de tabla scrolleable */
      .table-container {
        position: relative;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      
      .table-scroll-wrapper {
        overflow-x: auto;
        overflow-y: hidden;
        max-height: 70vh;
        position: relative;
      }
      
      .responsive-table {
        width: 100%;
        min-width: 1200px;
        background: white;
        table-layout: auto;
      }
      
      /* Headers pegajosos */
      .table-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: #f8f9fa !important;
        border-bottom: 2px solid #dee2e6;
      }
      
      .table-header th {
        background: #f8f9fa !important;
        font-weight: 600;
        color: #495057;
        text-transform: uppercase;
        font-size: 0.875rem;
        letter-spacing: 0.5px;
        padding: 16px 12px !important;
        border-bottom: 2px solid #dee2e6;
      }
      
      /* Filas de la tabla */
      .table-row {
        transition: all 0.2s ease;
        border-bottom: 1px solid #e9ecef;
      }
      
      .table-row:hover {
        background-color: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .table-row td {
        padding: 16px 12px !important;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
      }
      
      /* Anchos automáticos basados en contenido */
      .column-id { 
        min-width: 80px; 
        white-space: nowrap;
      }
      .column-fecha { 
        min-width: 90px; 
        white-space: nowrap;
      }
      .column-tipo-servicio { 
        min-width: 120px; 
        white-space: nowrap;
      }
      .column-cliente { 
        min-width: 140px; 
        white-space: nowrap;
      }
      .column-solicita { 
        min-width: 140px; 
        white-space: nowrap;
      }
      .column-local { 
        min-width: 120px; 
        white-space: nowrap;
      }
      .column-fecha-visita { 
        min-width: 100px; 
        white-space: nowrap;
      }
      .column-tecnico { 
        min-width: 140px; 
        white-space: nowrap;
      }
      .column-status { 
        min-width: 100px; 
        white-space: nowrap;
      }
      .column-observaciones { 
        min-width: 150px; 
        max-width: 300px;
        white-space: normal;
        word-wrap: break-word;
      }
      .column-fecha-validacion { 
        min-width: 130px; 
        white-space: nowrap;
      }
      .column-mes-facturacion { 
        min-width: 120px; 
        white-space: nowrap;
      }
      .column-sla { 
        min-width: 120px; 
        white-space: nowrap;
        text-align: center;
      }
      .column-tiempo-restante { 
        min-width: 110px; 
        white-space: nowrap;
        text-align: center;
      }
      .column-tiempo { 
        min-width: 80px; 
        white-space: nowrap;
        text-align: center;
      }
      .column-cumplimiento { 
        min-width: 100px; 
        white-space: nowrap;
        text-align: center;
      }
      .column-acciones { 
        min-width: 120px; 
        white-space: nowrap;
        text-align: center;
      }
      
      /* Badges y estados */
      .badge {
        display: inline-block;
        padding: 4px 8px;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 4px;
      }
      
      .badge-info {
        color: #0c5460;
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
      }
      
      .badge-secondary {
        color: #383d41;
        background-color: #e2e3e5;
        border: 1px solid #d6d8db;
      }
      
      /* Estados de servicio */
      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-completed {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .status-in-progress {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      
      .status-pending {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      
      .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      
      .status-validated {
        background-color: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }
      
      .status-finished {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .status-default {
        background-color: #e2e3e5;
        color: #383d41;
        border: 1px solid #d6d8db;
      }
      
      /* Utilidades de texto */
      .text-truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
      
      .column-observaciones .text-truncate {
        white-space: normal;
        text-overflow: unset;
        overflow: visible;
        display: block;
        line-height: 1.4;
        max-height: 4.2em;
        overflow: hidden;
      }
      
      .text-success { color: #28a745; }
      .text-muted { color: #6c757d; }
      .font-weight-bold { font-weight: 600; }
      
      /* Botones de acción */
      .action-buttons {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
      }
      
      .action-btn {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }
      
      /* SLA Info */
      .sla-info {
        text-align: center;
        line-height: 1.2;
      }
      
      .sla-info small {
        display: block;
        color: #6c757d;
      }
      
      /* Scrollbar personalizada */
      .table-scroll-wrapper::-webkit-scrollbar {
        height: 8px;
      }
      
      .table-scroll-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      .table-scroll-wrapper::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }
      
      .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .table-scroll-wrapper {
          max-height: 50vh;
        }
      }
    `,
  ],
})
export class ServiciosRealizadosComponent implements OnInit {
  programacionForm: FormGroup;
  tiposServicio: any[] = [];
  tiposSolicitud:any[] = [];
  meses: any[] = [];
  isGruman: boolean = false;
  clientes: any[] = [];
  selectedCompany: any;
  serviciosRealizados: any[] = [];
  displayedColumns: string[] = [
    'id',
    'fechaIngreso',
    'cliente',
    'local',
    'solicita',
    'fechaVisita',
    'tipoServicio',
    'tecnico',
    'sla',
    'tiempoRestante',
    'tiempo',
    'cumplimiento',
    'status',
    'mesFacturacion',
    'fechaValidacion',
    'acciones',
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
    private facturacionService: FacturacionService,
    private solicitarVisitaService: SolicitarVisitaService,
    private tipoSolicitudService: TipoSolicitudService
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
      diaSeleccionadoInicio: [null, Validators.required],
      diaSeleccionadoTermino: [null, Validators.required],
      mesFacturacion: [null],
      tipoBusqueda: ['mesFacturacion', Validators.required], // Valor por defecto
      tipoSolicitud: [null],
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
      this.programacionForm
        .get('clientId')
        ?.valueChanges.subscribe((clientId) => {
          if (clientId) {
            this.loadTiposServicio(clientId);
          } else {
            this.tiposServicio = [];
          }
          // Resetear el tipo de servicio cuando cambia el cliente
          this.programacionForm.get('tipoServicio')?.setValue(null);
        });
    }

    // Configurar validaciones dinámicas basadas en tipoBusqueda
    this.configurarValidacionesTipoBusqueda();
    
    this.programacionForm
      .get('tipoBusqueda')
      ?.valueChanges.subscribe((value) => {
        this.configurarValidacionesTipoBusqueda();
      });
  }

  private configurarValidacionesTipoBusqueda() {
    const value = this.programacionForm.get('tipoBusqueda')?.value;
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
  }

  loadTiposServicio(clientId: number) {
    const cliente = this.clientes.find((c) => c.id === clientId);
    this.tipoSolicitudService
      .findByClienteId(clientId)
      .then((response: any) => {
        this.tiposSolicitud = response;
      });

    if (cliente) {
      // Filtrar servicios activos y no eliminados
      this.tiposServicio = cliente.tipoServicio
        .filter((servicio: any) => servicio.activo && !servicio.deleted)
        .map((servicio: any) => ({
          id: servicio.id,
          nombre: servicio.nombre_servicio || servicio.nombre, // Fallback to nombre if nombre_servicio doesn't exist
        }));
      console.log('Tipos de servicio cargados:', this.tiposServicio);
    } else if (!this.isGruman) {
      // Si no es Gruman, buscar en la compañía seleccionada
      this.tiposServicio =
        this.selectedCompany.tipoServicio
          ?.filter((servicio: any) => servicio.activo && !servicio.deleted)
          .map((servicio: any) => ({
            id: servicio.id,
            nombre: servicio.nombre_servicio || servicio.nombre,
          })) || [];
    }
  }

  fechaTerminoMayorQueInicio(
    control: AbstractControl
  ): ValidationErrors | null {
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
    this.loadTiposSolicitud();
  }

  loadTiposSolicitud() {
    this.tipoSolicitudService.findAll().subscribe({
      next: (tipos: any[]) => {
        this.tiposSolicitud = tipos;
        console.log('Tipos de solicitud cargados:', this.tiposSolicitud.length);
      },
      error: (error: any) => {
        console.error('Error al cargar tipos de solicitud:', error);
        this.tiposSolicitud = [];
      },
    });
  }

  loadClientes() {
    this.clientesService.getClientesWithTipoSolicitud().subscribe({
      next: (clientes: any[]) => {
        this.clientes = clientes.filter(
          (cliente) => cliente.tipoSolicitudId !== null
        );

        console.log('Clientes cargados:', this.clientes.length);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = [];
      },
    });
  }

  onSubmit() {
    if (this.programacionForm.invalid) {
      return;
    }

    const formData = this.programacionForm.value;
    const params: any = {
      tipoBusqueda: formData.tipoBusqueda,
      clientId: this.isGruman ? formData.clientId : this.selectedCompany.id,
    };

    // Agregar parámetros opcionales solo si tienen un valor diferente a 'todos'
    if (formData.tipoServicio && formData.tipoServicio !== 'todos') {
      params.tipoServicio = formData.tipoServicio;
    }

    if (
      formData.tipo_mantenimiento &&
      formData.tipo_mantenimiento !== 'todos'
    ) {
      params.tipo_mantenimiento = formData.tipo_mantenimiento;
    }

    if (formData.tipoBusqueda === 'rangoFechas') {
      if (formData.diaSeleccionadoInicio) {
        params.fechaInicio = this.formatDate(formData.diaSeleccionadoInicio);
      }
      if (formData.diaSeleccionadoTermino) {
        params.fechaFin = this.formatDate(formData.diaSeleccionadoTermino);
      }
    } else if (
      formData.tipoBusqueda === 'mesFacturacion' &&
      formData.mesFacturacion
    ) {
      params.mesFacturacion = formData.mesFacturacion;
    }

    console.log('[Component] Calling service with params:', params);
    this.serviciosRealizadosService.getAll(params).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.serviciosRealizados = response.data;
          this.panelOpenState = false;
          console.log(
            '[Component] Servicios realizados:',
            this.serviciosRealizados
          );
        }
      },
      error: (error) => {
        console.error('[Component] Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los servicios realizados',
        });
      },
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
      'Enero 2025',
      'Febrero 2025',
      'Marzo 2025',
      'Abril 2025',
      'Mayo 2025',
      'Junio 2025',
      'Julio 2025',
      'Agosto 2025',
      'Septiembre 2025',
      'Octubre 2025',
      'Noviembre 2025',
      'Diciembre 2025',
      'Enero 2026',
      'Febrero 2026',
      'Marzo 2026',
      'Abril 2026',
      'Mayo 2026',
    ];

    this.meses = meses;
    console.log('Meses generados localmente:', this.meses);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL');
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Completado': 'status-completed',
      'En Proceso': 'status-in-progress',
      'Pendiente': 'status-pending',
      'Cancelado': 'status-cancelled',
      'Validado': 'status-validated',
      'Finalizado': 'status-finished'
    };
    return statusClasses[status] || 'status-default';
  }

  getTiempoRestante(solicitud: any) {
    if (!solicitud.tipoSolicitud) {
      return '-';
    }

    const fechaIngreso = new Date(solicitud.fechaIngreso);
    const fechaActual = new Date();
    
    const slaDias = solicitud.tipoSolicitud.sla_dias || 0;
    const slaHoras = solicitud.tipoSolicitud.sla_horas || 0;
    
    // Calcular la fecha límite basada en el SLA
    let fechaLimite = new Date(fechaIngreso);
    
    if (slaDias > 0) {
      // Si hay días definidos, usamos los días como referencia
      fechaLimite.setDate(fechaLimite.getDate() + slaDias);
      if (slaHoras > 0) {
        // Si también hay horas, las agregamos
        fechaLimite.setHours(fechaLimite.getHours() + slaHoras);
      }
    } else if (slaHoras > 0) {
      // Si no hay días pero sí horas, usamos solo las horas
      fechaLimite.setHours(fechaLimite.getHours() + slaHoras);
    } else {
      return '-';
    }
    
    // Calcular el tiempo restante en milisegundos
    const tiempoRestanteMs = fechaLimite.getTime() - fechaActual.getTime();
    
    // Si ya se venció el SLA
    if (tiempoRestanteMs <= 0) {
      const tiempoVencido = Math.abs(tiempoRestanteMs);
      const diasVencidos = Math.floor(tiempoVencido / (1000 * 60 * 60 * 24));
      const horasVencidas = Math.floor((tiempoVencido % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutosVencidos = Math.floor((tiempoVencido % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diasVencidos > 0) {
        return `Vencido`;
      } else if (horasVencidas > 0) {
        return `Vencido`;
      } else {
        return `Vencido`;
      }
    }
    
    // Calcular días, horas y minutos restantes
    const diasRestantes = Math.floor(tiempoRestanteMs / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.floor((tiempoRestanteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Formatear la respuesta
    if (diasRestantes > 0) {
      return `${diasRestantes}d ${horasRestantes}h ${minutosRestantes}m`;
    } else if (horasRestantes > 0) {
      return `${horasRestantes}h ${minutosRestantes}m`;
    } else {
      return `${minutosRestantes}m`;
    }
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
      this.router.createUrlTree([
        '/transacciones/servicios-realizados',
        servicio.id,
      ])
    );
    // Abrir en una nueva pestaña
    window.open(url, '_blank');
  }

  exportarExcel(): void {
    if (!this.serviciosRealizados || this.serviciosRealizados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar a Excel',
      });
      return;
    }

    // Preparar los datos para la exportación
    const datosParaExportar = this.serviciosRealizados.map((servicio) => ({
      'Número de Solicitud': servicio.id,
      Cliente: servicio.client?.nombre || 'No asignado',
      Local: servicio.local?.nombre_local || 'No asignado',
      'Fecha de Visita': this.formatDate(servicio.fechaVisita),
      'Tipo de Servicio': servicio.tipoServicio?.nombre || 'No especificado',
      Técnico: servicio.tecnico_asignado
        ? `${servicio.tecnico_asignado.name} ${servicio.tecnico_asignado.lastName}`
        : 'No asignado',
      'Técnico 2': servicio.tecnico_asignado_2
        ? `${servicio.tecnico_asignado_2.name} ${servicio.tecnico_asignado_2.lastName}`
        : 'No asignado',
      'Tipo Mantenimiento': servicio.tipo_mantenimiento || 'No especificado',
      Estado: servicio.status || 'No definido',
      'Mes Facturación': servicio.facturacion?.mes || 'No asignado',
      Observaciones: servicio.observaciones || 'Sin observaciones',
    }));

    // Crear el libro de trabajo y la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 10 }, // Número de Solicitud
      { wch: 30 }, // Cliente
      { wch: 30 }, // Local
      { wch: 15 }, // Fecha de Visita
      { wch: 25 }, // Tipo de Servicio
      { wch: 30 }, // Técnico
      { wch: 30 }, // Técnico 2
      { wch: 20 }, // Tipo Mantenimiento
      { wch: 15 }, // Estado
      { wch: 20 }, // Mes Facturación
      { wch: 50 }, // Observaciones
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
      showConfirmButton: false,
    });
  }
  downloadPdf(row: any) {
    Swal.fire({
      title: 'Generando PDF',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.solicitarVisitaService.downloadPdf(row.id).subscribe({
      next: (blob: Blob) => {
        if (blob.size === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El PDF generado está vacío',
          });
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `solicitud-${row.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.close();
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF. Por favor intente nuevamente.',
        });
      },
    });
  }
}
