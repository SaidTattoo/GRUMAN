import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes-de-visita',
  standalone: true,
  imports: [
    CommonModule, 
    MatCard, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardContent,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './solicitudes-de-visita.component.html',
  styles: [`
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .mat-column-logo {
      width: 60px;
      padding: 8px;
    }
    .logo-cell {
      text-align: center;
    }
    .client-logo {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: contain;
    }
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-mdc-cell {
      padding: 8px 16px;
    }
    .mat-column-ticketGruman {
      min-width: 100px;
    }
    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      text-align: center;
    }
    .no-data-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.3);
    }
    .no-data-message p {
      margin: 4px 0;
      color: rgba(0, 0, 0, 0.6);
    }
    .text-muted {
      color: rgba(0, 0, 0, 0.6);
    }
    .action-buttons {
      margin: 16px 0;
    }
    .action-buttons button {
      margin-right: 8px;
    }
  `]
})
export class SolicitudesDeVisitaComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'id',
    'fechaIngreso',	
    'cliente',
    'local',
    'ticketGruman',
    'generado_por',
    // 'observaciones',
    'tipo_solicitud',
    'tiempo_restante',
    'estado',
    'imagenes',
    'acciones'
  ];

  allSolicitudes: any[] = [];
  selectedCompany: any = null;
  private companySubscription: Subscription | null = null;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private solicitarVisitaService: SolicitarVisitaService, 
    private router: Router,
    private storage: StorageService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    // Obtener la compañía seleccionada inicialmente
    const user = this.storage.getItem('currentUser');
    if (user && user.selectedCompany) {
      this.selectedCompany = user.selectedCompany;
    }
    
    this.loadSolicitudes();
    
    // Suscribirse a cambios en la compañía seleccionada
    this.companySubscription = this.storage.companyChange$.subscribe(company => {
      this.selectedCompany = company;
      this.filterByCompany();
    });
    
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchTermFilter = data.ticketGruman?.toLowerCase().includes(filter.toLowerCase());
      
      // Si no hay filtro de búsqueda, solo aplicamos el filtro de compañía
      if (!filter) return true;
      
      return searchTermFilter;
    };
  }

  ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
  }
  
  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSolicitudes() {
    this.loading = true;
    this.solicitarVisitaService.getSolicitudesVisita().subscribe({
      next: (data: any) => {
        this.allSolicitudes = data.filter((solicitud: any) => solicitud.status === 'pendiente');
        this.filterByCompany();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
        this.loading = false;
      }
    });
  }

  filterByCompany() {
    // Asegurarse de tener la empresa seleccionada actualizada
    if (!this.selectedCompany) {
      const user = this.storage.getItem('currentUser');
      if (user && user.selectedCompany) {
        this.selectedCompany = user.selectedCompany;
      }
    }
    
    // Si hay solicitudes cargadas, aplicar el filtro
    if (this.allSolicitudes && this.allSolicitudes.length > 0) {
      if (this.selectedCompany && this.selectedCompany.id) {
        if (this.selectedCompany.nombre === 'GRUMAN' || this.selectedCompany.nombre === 'Administrador') {
          // Para GRUMAN o Administrador, mostrar todas las solicitudes
          this.dataSource.data = this.allSolicitudes;
        } else {
          // Filtrar por la compañía seleccionada
          this.dataSource.data = this.allSolicitudes.filter(
            solicitud => solicitud.client && solicitud.client.id === this.selectedCompany.id
          );
        }
      } else {
        // Si no hay compañía seleccionada, mostrar todas las solicitudes
        this.dataSource.data = this.allSolicitudes;
      }
    } else {
      // Si no hay solicitudes, establecer un array vacío
      this.dataSource.data = [];
    }
    
    // Resetear el paginador si está disponible
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verSolicitud(solicitud: any): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/transacciones/solicitudes-de-visita/ver-solicitud/pendiente', solicitud.id])
    );
    window.open(url, '_blank');
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.png';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportarExcel(): void {
    if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar a Excel'
      });
      return;
    }

    // Preparar los datos para la exportación
    const datosParaExportar = this.dataSource.data.map(solicitud => ({
      'Número de solicitud': solicitud.id,
      'Cliente': solicitud.client?.nombre || 'No asignado',
      'Local': solicitud.local?.nombre_local || 'No asignado',
      'Fecha de ingreso': this.formatDate(solicitud.fechaIngreso),
      'Ticket Gruman': solicitud.ticketGruman || 'Sin ticket',
      'Especialidad': solicitud.especialidad || 'No especificada',
      'Generado por': solicitud.generada_por ? `${solicitud.generada_por.name} ${solicitud.generada_por.lastName}` : 'Sin usuario',
      'Estado': solicitud.status || 'No definido',
      'Técnico': solicitud.tecnico_asignado ? `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}` : 'No asignado',
      // 'Observaciones': solicitud.observaciones || 'Sin observaciones'
    }));

    // Crear el libro de trabajo y la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 10 }, // Número de Solicitud
      { wch: 30 }, // Cliente
      { wch: 30 }, // Local
      { wch: 15 }, // Fecha de Ingreso
      { wch: 15 }, // Ticket Gruman
      { wch: 20 }, // Especialidad
      { wch: 30 }, // Generado por
      { wch: 15 }, // Estado
      { wch: 30 }, // Técnico
      { wch: 50 }  // Observaciones
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes de Visita');

    // Generar el archivo y descargarlo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Solicitudes_de_Visita_${fechaActual}.xlsx`;
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

  getTiempoRestante(solicitud: any) {
    if (!solicitud.tipo_solicitud) {
      return '-';
    }

    const fechaIngreso = new Date(solicitud.fechaIngreso);
    const fechaActual = new Date();
    
    const slaDias = solicitud.tipo_solicitud.sla_dias || 0;
    const slaHoras = solicitud.tipo_solicitud.sla_hora || 0;
    
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
        // return `Vencido: ${diasVencidos}d ${horasVencidas}h ${minutosVencidos}m`;
        return `Vencido`;
      } else if (horasVencidas > 0) {
        return `Vencido`;
        // return `Vencido: ${horasVencidas}h ${minutosVencidos}m`;
      } else {
        // return `Vencido: ${minutosVencidos}m`;
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
}

