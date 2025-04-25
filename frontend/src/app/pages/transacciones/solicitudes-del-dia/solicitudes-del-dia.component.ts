import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TecnicoSelectionModalComponent } from './tecnico-selection-modal/tecnico-selection-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { StorageService } from 'src/app/services/storage.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-solicitudes-del-dia',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './solicitudes-del-dia.component.html',
  styles: [`
    .badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
      display: inline-block;
      min-width: 80px;
      text-align: center;
    }
    .badge.bg-primary {
      background-color: #1e88e5 !important;
      color: white;
    }
    .badge.bg-warning {
      background-color: #ffc107 !important;
      color: #000;
    }
    .badge.bg-danger {
      background-color: #ef5350 !important;
      color: white;
    }
  `]
})
export class SolicitudesDelDiaComponent implements OnInit {
  displayedColumns: string[] = ['id', 'cliente', 'local', 'tipoServicio',   'estado','generado_por', 'tecnico', 'tecnico_2' ,'acciones'];
  dataSource: MatTableDataSource<any>;
  private originalData: any[] = [];
  currentUser: any;

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private dialog: MatDialog,
    private storage: StorageService
  ) {
    this.dataSource = new MatTableDataSource();
    this.currentUser = this.storage.getCurrentUser();
    console.log('Constructor CurrentUser:', this.currentUser);
  }

  ngOnInit() {
    this.cargarSolicitudesDelDia();
    this.setupFilter();
  }

  private setupFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchText = filter.toLowerCase();
      
      // Buscar en ID
      const idMatch = data.id.toString().includes(searchText);
      
      // Buscar en cliente
      const clienteMatch = data.client?.nombre?.toLowerCase().includes(searchText);
      
      // Buscar en local
      const localMatch = data.local?.nombre_local?.toLowerCase().includes(searchText);
      
      // Buscar en técnico 1
      const tecnico1Match = (data.tecnico_asignado?.name + ' ' + data.tecnico_asignado?.lastName)
        ?.toLowerCase()
        .includes(searchText);
      
      // Buscar en técnico 2
      const tecnico2Match = (data.tecnico_asignado_2?.name + ' ' + data.tecnico_asignado_2?.lastName)
        ?.toLowerCase()
        .includes(searchText);

      return idMatch || clienteMatch || localMatch || tecnico1Match || tecnico2Match;
    };
  }

  cargarSolicitudesDelDia() {
    console.log('[Component] Iniciando carga de solicitudes del día');
    this.solicitarVisitaService.getSolicitudesDelDia().subscribe({
      next: (response: any) => {
        console.log('[Component] Datos recibidos:', response);
        if (response && response.success) {
          this.originalData = response.data || [];
        } else if (Array.isArray(response)) {
          this.originalData = response;
        } else {
          console.warn('[Component] Formato de respuesta inesperado:', response);
          this.originalData = [];
        }
        this.dataSource.data = this.originalData;
      },
      error: (error) => {
        console.error('[Component] Error al cargar solicitudes:', error);
        this.originalData = [];
        this.dataSource.data = [];
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openTecnicoModal(solicitud: any, tipo: 'tecnico' | 'tecnico_2'): void {
    const currentTecnicoId = tipo === 'tecnico' ? 
      solicitud.tecnico_asignado?.id : 
      solicitud.tecnico_asignado_2?.id;

    const dialogRef = this.dialog.open(TecnicoSelectionModalComponent, {
      width: '500px',
      data: {
        solicitudId: solicitud.id,
        currentTecnicoId: currentTecnicoId,
        tipo: tipo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.tecnicoId) {
        console.log('Modal result:', result);
        if (currentTecnicoId) {
          console.log('Changing existing technician');
          this.changeTecnico(solicitud.id, result.tecnicoId, tipo);
        } else {
          console.log('Assigning new technician');
          this.updateTecnicoAsignado(solicitud.id, result.tecnicoId, tipo, solicitud);
        }
      }
    });
  }

  updateTecnicoAsignado(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2', solicitud: any): void {
    // Validar si el técnico ya está asignado en la otra posición
    const otroTecnicoId = tipo === 'tecnico' ? 
      solicitud.tecnico_asignado_2?.id : 
      solicitud.tecnico_asignado?.id;

    if (tecnicoId === otroTecnicoId) {
      Swal.fire({
        title: 'Error',
        text: tipo === 'tecnico' ? 
          'El técnico ya está asignado como técnico 2 en esta solicitud' :
          'El técnico ya está asignado como técnico 1 en esta solicitud',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    this.solicitarVisitaService.asignarTecnico(solicitudId, tecnicoId, tipo).subscribe({
      next: () => {
        this.cargarSolicitudesDelDia();
      },
      error: (error) => {
        console.error('Error updating technician:', error);
        Swal.fire({
          title: 'Error',
          text: error.error.message || 'Error al asignar el técnico',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    });
  }

  changeTecnico(solicitudId: number, tecnicoId: number, tipo: 'tecnico' | 'tecnico_2') {
    console.log('Changing technician:', { solicitudId, tecnicoId, tipo });
    this.solicitarVisitaService.cambiarTecnico(solicitudId, tecnicoId, tipo).subscribe({
      next: (response) => {
        console.log('Technician changed successfully:', response);
        this.cargarSolicitudesDelDia();
      },
      error: (error) => {
        console.error('Error changing technician:', error);
        Swal.fire({
          title: 'Error',
          text: error.error.message || 'Error al cambiar el técnico',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    });
  }

  canDeleteSolicitud(solicitud: any): boolean {
    // Agregamos logs para debug
    console.log('Current User:', this.currentUser);
    console.log('Generada Por:', solicitud.generada_por);
    console.log('Status:', solicitud.status);
    
    // Estados permitidos para eliminar
    const allowedStatuses = [
      'aprobada',
      'en_servicio',
      'atendida_en_proceso',
      'pendiente'
    ];
    
    // Verificar tanto el usuario como el status
    const isOwner = this.currentUser?.id === solicitud.generada_por?.id;
    const hasValidStatus = allowedStatuses.includes(solicitud.status?.toLowerCase());
    
    const canDelete = isOwner && hasValidStatus;
    console.log('Can Delete:', canDelete, '(isOwner:', isOwner, ', hasValidStatus:', hasValidStatus, ')');
    
    return canDelete;
  }

  deleteSolicitud(solicitud: any): void {
    if (!this.canDeleteSolicitud(solicitud)) {
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la solicitud #${solicitud.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
         this.solicitarVisitaService.deleteSolicitud(solicitud.id ).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La solicitud ha sido eliminada', 'success');
            this.cargarSolicitudesDelDia();
          },
          error: (error) => {
            console.error('Error deleting solicitud:', error);
            Swal.fire('Error', 'No se pudo eliminar la solicitud', 'error');
          }
        });
      }
    });
  }

  canChangeToAtendidaEnProceso(element: any): boolean {
    return element.status?.toLowerCase() === 'en_servicio';
  }

  async cambiarAAtendidaEnProceso(element: any) {
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `¿Deseas cambiar el estado de la solicitud #${element.id} a "Atendida en Proceso"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.solicitarVisitaService.cambiarEstado(element.id, 'atendida_en_proceso').toPromise();
        await Swal.fire('¡Éxito!', 'El estado ha sido actualizado', 'success');
        this.cargarSolicitudesDelDia();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        await Swal.fire('Error', 'No se pudo cambiar el estado de la solicitud', 'error');
      }
    }
  }

  exportarExcel() {
    if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) {
      Swal.fire({
        title: 'No hay datos',
        text: 'No hay solicitudes para exportar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Preparar los datos para el Excel
    const datosParaExportar = this.dataSource.data.map(solicitud => ({
      'Número de Solicitud': solicitud.id,
      'Cliente': solicitud.client?.nombre || 'No asignado',
      'Local': solicitud.local?.nombre_local || 'No asignado',
      'Tipo de Servicio': solicitud.tipoServicio?.nombre || 'No asignado',
      'Estado': solicitud.status || 'No asignado',
      'Generado por': `${solicitud.generada_por?.name || ''} ${solicitud.generada_por?.lastName || ''}`,
      'Técnico': solicitud.tecnico_asignado ? 
        `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}` : 
        'No asignado',
      'Técnico 2': solicitud.tecnico_asignado_2 ? 
        `${solicitud.tecnico_asignado_2.name} ${solicitud.tecnico_asignado_2.lastName}` : 
        'No asignado'
    }));

    // Crear el libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar el ancho de las columnas
    const columnsWidths = [
      { wch: 15 }, // Número de Solicitud
      { wch: 30 }, // Cliente
      { wch: 30 }, // Local
      { wch: 25 }, // Tipo de Servicio
      { wch: 15 }, // Estado
      { wch: 30 }, // Generado por
      { wch: 30 }, // Técnico
      { wch: 30 }, // Técnico 2
    ];
    worksheet['!cols'] = columnsWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes del Día');

    // Generar el archivo y descargarlo
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Solicitudes_Del_Dia_${fecha}.xlsx`);

    // Mostrar mensaje de éxito
    Swal.fire({
      title: '¡Éxito!',
      text: 'El archivo Excel se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
} 