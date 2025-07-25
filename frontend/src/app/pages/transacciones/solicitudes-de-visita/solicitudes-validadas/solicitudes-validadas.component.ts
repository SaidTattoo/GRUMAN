import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes-validadas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './solicitudes-validadas.component.html',
  styleUrls: ['./solicitudes-validadas.component.scss']
})
export class SolicitudesValidadasComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'cliente',
    'local',
    'fechaIngreso',
    'ticketGruman',
    'especialidad',
    'generado_por',
    'validada_por',
    'fecha_hora_validacion',
    'observaciones',
    'tecnico',
    'status',
    'actions'
  ];

  dataSource: MatTableDataSource<any>;
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private storage: StorageService
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    // Obtener la compañía seleccionada inicialmente
    const user = this.storage.getItem('currentUser');
    if (user && user.selectedCompany) {
      this.selectedCompany = user.selectedCompany;
    }
    
    this.loadEspecialidades();
    this.loadSolicitudes();
    
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

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.png';
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

  loadSolicitudes() {
    this.loading = true;
    this.solicitarVisitaService.getSolicitudesValidadas().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.allSolicitudes = data;
        this.filterByCompany();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando solicitudes validadas:', error);
        this.snackBar.open('Error al cargar las solicitudes', 'Cerrar', {
          duration: 3000
        });
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
    
    if (this.selectedCompany && this.selectedCompany.id && this.selectedCompany.nombre !== 'GRUMAN') {
      // Filtrar por la compañía seleccionada
      this.dataSource.data = this.allSolicitudes.filter(
        solicitud => solicitud.client && solicitud.client.id === this.selectedCompany.id
      );
    } else {
      // Mostrar todas las solicitudes
      this.dataSource.data = this.allSolicitudes;
    }
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['transacciones/solicitudes-de-visita/ver-solicitud/validada', id]);
  }

  reabrirSolicitud(solicitud: any) {
    // Mostrar diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reabrir Solicitud',
        message: '¿Está seguro que desea reabrir esta solicitud?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.solicitarVisitaService.reabrirSolicitud(solicitud.id).subscribe({
          next: () => {
            this.snackBar.open('Solicitud reabierta exitosamente', 'Cerrar', {
              duration: 3000
            });
            this.loadSolicitudes(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error al reabrir la solicitud:', error);
            this.snackBar.open('Error al reabrir la solicitud', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  editarSolicitud(row: any): void {
    this.router.navigate([`/transacciones/solicitudes-de-visita/modificar/${row.id}`]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verHistorial(solicitud: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/validadas/historial', solicitud.id]);
  }

  downloadPdf(row: any) {
    Swal.fire({
      title: 'Generando PDF',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    console.log('🔍 Iniciando descarga de PDF para solicitud:', row.id);

    this.solicitarVisitaService.downloadPdf(row.id).subscribe({
      next: (blob: Blob) => {
        console.log('📁 Blob recibido:', {
          size: blob.size,
          type: blob.type,
          blob: blob
        });

        Swal.close();

        // Validación mejorada del blob
        if (!blob || blob.size === 0) {
          console.error('❌ PDF vacío recibido');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El PDF generado está vacío'
          });
          return;
        }

        // Verificar que el tipo de contenido sea correcto
        if (blob.type !== 'application/pdf' && blob.type !== 'application/octet-stream') {
          console.warn('⚠️ Tipo de blob inesperado:', blob.type);
        }

        try {
          // Crear URL y descargar
          const url = window.URL.createObjectURL(blob);
          console.log('🔗 URL creada:', url);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `solicitud-${row.id}.pdf`;
          
          console.log('📥 Iniciando descarga del archivo:', link.download);
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Limpiar URL después de un delay
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            console.log('🧹 URL limpiada');
          }, 1000);

          console.log('✅ Descarga completada exitosamente');

        } catch (downloadError) {
          console.error('❌ Error en el proceso de descarga:', downloadError);
          Swal.fire({
            icon: 'error',
            title: 'Error de Descarga',
            text: 'Error al procesar el archivo PDF'
          });
        }
      },
      error: (error) => {
        console.error('❌ Error descargando PDF:', error);
        console.error('📋 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF. Por favor intente nuevamente.'
        });
      }
    });
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
      'Ticket Gruman': solicitud.ticketGruman || 'Sin ticket',
      'Especialidad': this.especialidades[solicitud.especialidad] || 'No especificada',
      'Generado por': solicitud.generada_por ? `${solicitud.generada_por.name} ${solicitud.generada_por.lastName}` : 'Sin usuario',
      'Validado por': solicitud.validada_por ? `${solicitud.validada_por.name} ${solicitud.validada_por.lastName}` : 'Sin usuario',
      'Fecha y hora validación': solicitud.fecha_hora_validacion ? new Date(solicitud.fecha_hora_validacion).toLocaleString() : 'No disponible',
      'Observaciones': solicitud.observaciones || 'Sin observaciones',
      'Técnico': solicitud.tecnico_asignado ? `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}` : 'No asignado',
      'Estado': solicitud.status === 'reabierta' ? 'Reabierta' : 'Validada'
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
      { wch: 30 }, // Validado por
      { wch: 20 }, // Fecha y hora validación
      { wch: 50 }, // Observaciones
      { wch: 30 }, // Técnico
      { wch: 15 }  // Estado
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes Validadas');

    // Generar el archivo y descargarlo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Solicitudes_Validadas_${fechaActual}.xlsx`;
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