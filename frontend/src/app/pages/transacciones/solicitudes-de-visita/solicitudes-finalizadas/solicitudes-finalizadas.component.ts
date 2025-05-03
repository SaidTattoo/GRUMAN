import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-solicitudes-finalizadas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './solicitudes-finalizadas.component.html',
  styleUrls: ['./solicitudes-finalizadas.component.scss']
})
export class SolicitudesFinalizadasComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'id',
    'cliente',
    'local',
    'fechaIngreso',
    'especialidad',
    'ticketGruman',
    'generado_por',
    'observaciones',
    'tecnico',
    'acciones',
    // 'pdf'
  ];

  loading = false;
  allSolicitudes: any[] = [];
  selectedCompany: any = null;
  private companySubscription: Subscription | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  especialidades: { [key: number]: string } = {};

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private especialidadesService: EspecialidadesService,
    private router: Router,
    private storage: StorageService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadEspecialidades();
    this.loadSolicitudes();

    // Obtener la compañía seleccionada inicialmente
    const user = this.storage.getItem('currentUser');
    if (user && user.selectedCompany) {
      this.selectedCompany = user.selectedCompany;
    }

    // Suscribirse a cambios en la compañía seleccionada
    this.companySubscription = this.storage.companyChange$.subscribe(company => {
      this.selectedCompany = company;
      this.filterByCompany();
    });

    // Configurar cómo se filtra la tabla
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.id?.toString().includes(searchStr) ||                    // Filtrar por ID
        data.ticketGruman?.toLowerCase().includes(searchStr) ||       // Filtrar por ticket
        data.client?.nombre?.toLowerCase().includes(searchStr) ||     // Filtrar por nombre del cliente
        data.local?.nombre_local?.toLowerCase().includes(searchStr)   // Filtrar por nombre del local
      );
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
  }

  loadSolicitudes() {
    this.loading = true;
    this.solicitarVisitaService.getSolicitudesFinalizadas().subscribe({
      next: (data) => {
        this.allSolicitudes = data;
        // Aplicar filtro inmediatamente con la empresa actual
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

  loadEspecialidades() {
    this.especialidadesService.findAll().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades.reduce((acc, esp) => {
          acc[esp.id] = esp.nombre;
          return acc;
        }, {} as { [key: number]: string });
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
      }
    });
  }

  finalizarSolicitud(solicitud: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/modificar', solicitud.id]);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

 

  exportarExcel() {
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
      'Número de Solicitud': solicitud.id,
      'Cliente': solicitud.client?.nombre || 'No asignado',
      'Local': solicitud.local?.nombre_local || 'No asignado',
      'Fecha de Ingreso': this.formatDate(solicitud.fechaIngreso),
      'Especialidad': this.especialidades[solicitud.especialidad] || 'No especificada',
      'Ticket Gruman': solicitud.ticketGruman || 'Sin ticket',
      'Generado por': solicitud.generada_por ? `${solicitud.generada_por.name} ${solicitud.generada_por.lastName}` : 'Sin usuario',
      'Observaciones': solicitud.observaciones || 'Sin observaciones',
      'Técnico': solicitud.tecnico_asignado ? `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}` : 'No asignado'
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
      { wch: 20 }, // Especialidad
      { wch: 15 }, // Ticket Gruman
      { wch: 30 }, // Generado por
      { wch: 50 }, // Observaciones
      { wch: 30 }  // Técnico
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes Finalizadas');

    // Generar el archivo y descargarlo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Solicitudes_Finalizadas_${fechaActual}.xlsx`;
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