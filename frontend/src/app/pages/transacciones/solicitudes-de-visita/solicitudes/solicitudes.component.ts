import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { FacturacionService } from 'src/app/services/facturacion.service';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { StorageService } from 'src/app/services/storage.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { PageEvent } from '@angular/material/paginator';
import { format } from 'date-fns';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatIconModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './solicitudes.component.html',
  styles: [`
    .page-header {
      margin-bottom: 20px;
    }
    
    .page-header h2 {
      margin: 0 0 8px;
      font-weight: 500;
    }
    
    .page-header .description {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 0;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }
    
    .table-container {
      position: relative;
      min-height: 200px;
      max-height: 600px;
      overflow: auto;
    }
    
    .no-data-container {
      padding: 20px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .badge {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      display: inline-block;
    }
    
    .badge-primary {
      background-color: #1e88e5;
      color: white;
    }
    
    .badge-success {
      background-color: #43a047;
      color: white;
    }
    
    .badge-warning {
      background-color: #ffa000;
      color: white;
    }
    
    .badge-danger {
      background-color: #e53935;
      color: white;
    }
    
    .badge-info {
      background-color: #00acc1;
      color: white;
    }
    
    .badge-secondary {
      background-color: #757575;
      color: white;
    }
    
    mat-expansion-panel {
      margin-bottom: 20px;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  `]
})
export class SolicitudesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  searchForm: FormGroup;
  isGruman: boolean = false;
  clientes: any[] = [];
  mesesFacturacion: string[] = [];
  loading: boolean = false;
  filterPanelOpen: boolean = true;
  
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'id',
    'cliente',
    'local',
    'fechaVisita',
    'tecnico',
    'tipoMantenimiento',
    'estado',
    'mesFacturacion',
    'acciones'
  ];

  // Añadir propiedades para paginación
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageIndex: number = 0;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private solicitarVisitaService: SolicitarVisitaService,
    private clientesService: ClientesService,
    private facturacionService: FacturacionService
  ) {
    this.initForm();
    this.checkUserRole();
  }

  ngOnInit(): void {
    // Inicializar el dataSource con paginación y ordenamiento
   // this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.loadInitialData();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      clienteId: [''],
      estado: [''],
      tipoMantenimiento: [''],
      mesFacturacion: [''],
      fechaDesde: [null],
      fechaHasta: [null]
    });

    // Subscribe to form changes
    this.searchForm.valueChanges.subscribe(() => {
      if (this.searchForm.valid) {
        this.onSearch();
      }
    });
  }

  private checkUserRole(): void {
    const userData = this.storageService.getCurrentUserWithCompany();
    if (userData) {
      const userRole = userData.profile;
      const selectedCompany = userData.selectedCompany;
      
      // Verificar si el usuario es de GRUMAN
      this.isGruman = selectedCompany && selectedCompany.nombre === 'GRUMAN';
      
      // Si no es GRUMAN, establecer el ID del cliente
     /*  if (!this.isGruman && selectedCompany) {
        this.searchForm.get('clienteId').setValue(selectedCompany.id);
        this.searchForm.get('clienteId').disable();
      } */
    }
  }

  private loadInitialData(): void {
    this.loading = true;
    
    // Cargar datos iniciales en paralelo
    const observables = [
      this.facturacionService.obtenerMesesUnicos()
    ];
    
    if (this.isGruman) {
      observables.push(this.clientesService.getClientesWithGruman());
    }
    
    forkJoin(observables).subscribe({
      next: (results) => {
      /*   this.mesesFacturacion = results[0] as string[]; */
        
        if (this.isGruman && results[1]) {
          this.clientes = results[1] as any[];
        }
        
        // Cargar solicitudes iniciales
        this.loadSolicitudes();
      },
      error: (error) => {
        console.error('Error cargando datos iniciales:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar datos iniciales', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }

  async loadSolicitudes(event?: PageEvent): Promise<void> {
    try {
      this.isLoading = true;
      
      // Update pagination if event exists
      if (event) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
      }

      // Prepare search parameters
      const params = {
        ...this.prepareSearchParams(),
        page: this.pageIndex + 1,
        limit: this.pageSize
      };

      // Call service with pagination
      const response = await this.solicitarVisitaService.getSolicitudesVisitaMultifiltro(params).toPromise();
      console.log('Backend Response:', response); // Imprime toda la respuesta
      console.log('Response Data Length:', response?.data?.length); // Cuántos items llegaron en esta página
      console.log('Response Total FIELD:', response?.total); // CUAL es el valor del campo 'total' en la respuesta
      // Update data source and pagination
      this.dataSource.data = response.data;
      this.totalItems = response.total;
      console.log('this.totalItems SET TO:', this.totalItems); // Verifica el valor final asignado a totalItems

    } catch (error) {
      console.error('Error loading requests:', error);
      this.snackBar.open('Error al cargar las solicitudes. Por favor, intente nuevamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } finally {
      this.isLoading = false;
    }
  }

  private prepareSearchParams(): any {
    const params: any = {};
    
    if (this.searchForm.get('clienteId')?.value) {
      params.clienteId = this.searchForm.get('clienteId')?.value;
    }
    
    if (this.searchForm.get('estado')?.value) {
      params.status = this.searchForm.get('estado')?.value;
    }
    
    if (this.searchForm.get('tipoMantenimiento')?.value) {
      params.tipoMantenimiento = this.searchForm.get('tipoMantenimiento')?.value;
    }
    
    if (this.searchForm.get('mesFacturacion')?.value) {
      params.mesFacturacion = this.searchForm.get('mesFacturacion')?.value;
    }
    
    const fechaDesde = this.searchForm.get('fechaDesde')?.value;
    if (fechaDesde) {
      params.fechaDesde = format(fechaDesde, 'yyyy-MM-dd');
    }
    
    const fechaHasta = this.searchForm.get('fechaHasta')?.value;
    if (fechaHasta) {
      params.fechaHasta = format(fechaHasta, 'yyyy-MM-dd');
    }
    
    return params;
  }

  onSearch(): void {
    // Resetear a la primera página al buscar
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.currentPage = 1;
    }
    this.loadSolicitudes();
  }

  resetFilters(): void {
    this.searchForm.reset();
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.currentPage = 1;
    }
    this.loadSolicitudes();
  }

 
  verDetalle(solicitud: any): void {
   
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/transacciones/solicitudes-de-visita/ver-solicitud/pendiente', solicitud.id])
    );
    window.open(url, '_blank');
  }

 
  eliminarSolicitud(solicitud: any): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la solicitud #${solicitud.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
      /*   this.solicitarVisitaService.deleteSolicitud(solicitud.id).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire(
              'Eliminada',
              'La solicitud ha sido eliminada correctamente',
              'success'
            );
            this.loadSolicitudes();
          },
          error: (error) => {
            this.loading = false;
            console.error('Error eliminando solicitud:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar la solicitud',
              'error'
            );
          }
        }); */
      }
    });
  }

  exportarExcel(): void {
    if (!this.dataSource.data.length) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const dataToExport = this.prepareDataForExport();
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');
    
    // Autoajustar ancho de columnas
    const maxWidth = 50;
    const colWidths = this.calculateColumnWidths(dataToExport);
    worksheet['!cols'] = colWidths.map(width => ({ width: Math.min(width, maxWidth) }));
    
    // Generar archivo
    XLSX.writeFile(workbook, 'Solicitudes_de_Visita.xlsx');
  }

  private prepareDataForExport(): any[] {
    return this.dataSource.data.map(item => {
      return {
        'ID': item.id,
        'Cliente': item.client?.nombre || '',
        'Local': item.local?.nombre_local || '',
        'Fecha Visita': new DatePipe('es-CL').transform(item.fechaVisita, 'dd/MM/yyyy'),
        'Técnico': item.tecnico_asignado ? `${item.tecnico_asignado.name} ${item.tecnico_asignado.lastName}` : '',
        'Tipo Mantenimiento': this.getTipoMantenimientoLabel(item.tipo_mantenimiento),
        'Estado': this.getEstadoLabel(item.status),
        /* 'Mes Facturación': item.facturacion?.mes || 'No asignado' */
      };
    });
  }

  private calculateColumnWidths(data: any[]): number[] {
    if (!data.length) return [];
    
    const headers = Object.keys(data[0]);
    const widths = headers.map(header => header.length);
    
    data.forEach(row => {
      headers.forEach((header, i) => {
        const cellValue = String(row[header] || '');
        widths[i] = Math.max(widths[i], cellValue.length);
      });
    });
    
    // Convertir a ancho aproximado de caracteres
    return widths.map(w => w + 2);
  }

  private formatDate(date: Date){
  /*   if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`; */
  }

  getTipoMantenimientoLabel(tipo: string): string {
    switch (tipo) {
      case 'correctivo': return 'Correctivo';
      case 'preventivo': return 'Preventivo';
      case 'scheduled': return 'Programado';
      default: return tipo || 'Desconocido';
    }
  }

  getTipoMantenimientoClass(tipo: string): string {
    switch (tipo) {
      case 'correctivo': return 'badge badge-danger';
      case 'preventivo': return 'badge badge-warning';
      case 'scheduled': return 'badge badge-info';
      default: return 'badge badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'validated': return 'Validada';
      case 'finalized': return 'Finalizada';
      default: return estado || 'Desconocido';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pending': return 'badge badge-warning';
      case 'approved': return 'badge badge-primary';
      case 'rejected': return 'badge badge-danger';
      case 'validated': return 'badge badge-success';
      case 'finalized': return 'badge badge-info';
      default: return 'badge badge-secondary';
    }
  }

  canDelete(solicitud: any): boolean {
    // Solo permitir eliminar solicitudes pendientes
    return solicitud.status === 'pending';
  }

  ngAfterViewInit() {
    // Configurar el dataSource después de que las vistas estén listas
  //  this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Suscribirse a los eventos de ordenamiento
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadSolicitudes();
      });
    }

    // Demorar la carga inicial para asegurar que el paginador esté listo
    setTimeout(() => {
      this.loadSolicitudes();
    });
  }

  onPageChange(event: any) {
    console.log('Page change event:', event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    
    // Asegurarnos de que el dataSource use el tamaño de página correcto
    this.dataSource.paginator = this.paginator;
   
  }

  loadClientes() {
    this.clientesService.getClientes().subscribe({
      next: (response) => {
        // Filtrar GRUMAN con una comparación más estricta
        this.clientes = response.filter(cliente => {
          const clienteName = cliente.nombre.trim().toUpperCase();
          return clienteName !== 'GRUMAN' && 
                 !clienteName.includes('GRUMAN');
        });
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
}
