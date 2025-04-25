import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { StorageService } from 'src/app/services/storage.service';
import Swal from 'sweetalert2';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-solicitudes-atendidas-en-proceso',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <div class="row justify-content-between m-b-8">
          <div class="col-sm-8">
            <h2 class="m-0">Solicitudes Atendidas en Proceso</h2>
          </div>
          <div class="col-sm-4">
            <mat-form-field appearance="outline" class="w-100 hide-hint">
              <mat-label>Buscar</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Buscar solicitud" #input>
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons my-3">
          <button mat-stroked-button color="primary" (click)="exportarExcel()">
            <mat-icon>file_download</mat-icon>
            Exportar a Excel
          </button>
        </div>

        <div class="table-responsive m-t-30">
          <table mat-table [dataSource]="dataSource" matSort class="w-100">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Número de Solicitud</th>
              <td mat-cell *matCellDef="let element">{{element.id}}</td>
            </ng-container>

            <!-- Cliente Column -->
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Cliente</th>
              <td mat-cell *matCellDef="let element">{{element.client?.nombre}}</td>
            </ng-container>

            <!-- Local Column -->
            <ng-container matColumnDef="local">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Local</th>
              <td mat-cell *matCellDef="let element">{{element.local?.nombre_local}}</td>
            </ng-container>

            <!-- Tipo Servicio Column -->
            <ng-container matColumnDef="tipoServicio">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo Servicio</th>
              <td mat-cell *matCellDef="let element">{{element.tipoServicio?.nombre}}</td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let element">{{element.status}}</td>
            </ng-container>

            <!-- Técnico Column -->
            <ng-container matColumnDef="tecnico">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Técnico</th>
              <td mat-cell *matCellDef="let element">
                {{element.tecnico_asignado ? (element.tecnico_asignado.name + ' ' + element.tecnico_asignado.lastName) : 'Sin técnico asignado'}}
              </td>
            </ng-container>

            <!-- Técnico 2 Column -->
            <ng-container matColumnDef="tecnico_2">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Técnico 2</th>
              <td mat-cell *matCellDef="let element">
                {{element.tecnico_asignado_2 ? (element.tecnico_asignado_2.name + ' ' + element.tecnico_asignado_2.lastName) : 'Sin técnico asignado'}}
              </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="primary" (click)="verDetalle(element)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" *ngIf="canDeleteSolicitud(element)" (click)="deleteSolicitud(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="8">No hay solicitudes atendidas en proceso</td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
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
    .badge.bg-primary { background-color: #1e88e5 !important; color: white; }
    .badge.bg-warning { background-color: #ffc107 !important; color: #000; }
    .badge.bg-danger { background-color: #ef5350 !important; color: white; }
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-mdc-cell {
      padding: 8px 16px;
    }
    .hide-hint ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class SolicitudesAtendidasEnProcesoComponent implements OnInit {
  displayedColumns: string[] = ['id', 'cliente', 'local', 'tipoServicio', 'estado', 'tecnico', 'tecnico_2', 'acciones'];
  dataSource: MatTableDataSource<any>;
  currentUser: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private storage: StorageService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource();
    this.currentUser = this.storage.getCurrentUser();
  }

  ngOnInit() {
    this.cargarSolicitudesAtendidasEnProceso();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarSolicitudesAtendidasEnProceso() {
    this.solicitarVisitaService.getSolicitudesAtendidasEnProceso().subscribe({
      next: (response: any) => {
        let solicitudes = [];
        if (response && response.success) {
          solicitudes = response.data || [];
        } else if (Array.isArray(response)) {
          solicitudes = response;
        }
       
        this.dataSource.data = solicitudes;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.dataSource.data = [];
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalle(solicitud: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/ver-solicitud/pendiente', solicitud.id]);
  }

  canDeleteSolicitud(solicitud: any): boolean {
    return this.currentUser?.id === solicitud.generada_por?.id;
  }

  deleteSolicitud(solicitud: any) {
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
        this.solicitarVisitaService.deleteSolicitud(solicitud.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La solicitud ha sido eliminada', 'success');
            this.cargarSolicitudesAtendidasEnProceso();
          },
          error: (error) => {
            console.error('Error deleting solicitud:', error);
            Swal.fire('Error', 'No se pudo eliminar la solicitud', 'error');
          }
        });
      }
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      'Tipo de Servicio': solicitud.tipoServicio?.nombre || 'No asignado',
      'Estado': solicitud.status || 'No definido',
      'Técnico': solicitud.tecnico_asignado ? `${solicitud.tecnico_asignado.name} ${solicitud.tecnico_asignado.lastName}` : 'No asignado',
      'Técnico 2': solicitud.tecnico_asignado_2 ? `${solicitud.tecnico_asignado_2.name} ${solicitud.tecnico_asignado_2.lastName}` : 'No asignado',
      'Generado por': solicitud.generada_por ? `${solicitud.generada_por.name} ${solicitud.generada_por.lastName}` : 'Sin usuario',
      'Observaciones': solicitud.observaciones || 'Sin observaciones'
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
      { wch: 20 }, // Tipo de Servicio
      { wch: 15 }, // Estado
      { wch: 30 }, // Técnico
      { wch: 30 }, // Técnico 2
      { wch: 30 }, // Generado por
      { wch: 50 }  // Observaciones
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes En Proceso');

    // Generar el archivo y descargarlo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Solicitudes_En_Proceso_${fechaActual}.xlsx`;
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