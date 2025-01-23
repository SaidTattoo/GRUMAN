import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-solicitudes-rechazadas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <div class="row justify-content-between m-b-8">
          <div class="col-sm-4 col-lg-3">
            <!-- Aquí podrías agregar un botón si lo necesitas -->
          </div>
          <div class="col-sm-4 col-lg-3">
            <mat-form-field appearance="outline" class="w-100 hide-hint">
              <input matInput (keyup)="applyFilter($event)" placeholder="Buscar por ticket" #input />
            </mat-form-field>
          </div>
        </div>

        <div class="table-responsive m-t-30">
          <table mat-table [dataSource]="dataSource" matSort class="w-100 mat-elevation-z8">
            <!-- Logo Column -->
            <ng-container matColumnDef="logo">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row" class="logo-cell">
                <img 
                  [src]="row.client?.logo || 'assets/images/no-image.png'" 
                  [alt]="row.client?.nombre || 'Logo cliente'"
                  class="client-logo"
                  (error)="onImageError($event)">
              </td>
            </ng-container>

            <!-- Cliente Column -->
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Cliente</th>
              <td mat-cell *matCellDef="let row">{{row.client?.nombre || 'No asignado'}}</td>
            </ng-container>

            <!-- Local Column -->
            <ng-container matColumnDef="local">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Local</th>
              <td mat-cell *matCellDef="let row">{{row.local?.nombre_local || 'No asignado'}}</td>
            </ng-container>

            <!-- Fecha Column -->
            <ng-container matColumnDef="fechaIngreso">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Ingreso</th>
              <td mat-cell *matCellDef="let row">{{formatDate(row.fechaIngreso)}}</td>
            </ng-container>

            <!-- Especialidad Column -->
            <ng-container matColumnDef="especialidad">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Especialidad</th>
              <td mat-cell *matCellDef="let row">{{row.especialidad || 'No especificada'}}</td>
            </ng-container>

            <!-- Ticket Column -->
            <ng-container matColumnDef="ticketGruman">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Ticket</th>
              <td mat-cell *matCellDef="let row">{{row.ticketGruman || 'Sin ticket'}}</td>
            </ng-container>

            <!-- Observaciones Column -->
            <ng-container matColumnDef="observaciones">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Observaciones</th>
              <td mat-cell *matCellDef="let row">
                {{ row.observaciones?.length > 100 ? (row.observaciones | slice:0:50) + '...' : row.observaciones }}
              </td>
            </ng-container>

            <!-- Motivo Rechazo Column -->
            <ng-container matColumnDef="motivo_rechazo">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Motivo Rechazo</th>
              <td mat-cell *matCellDef="let row" class="motivo-rechazo-cell">
                {{row.observacion_rechazo || 'Sin motivo especificado'}}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Seleccionar página"></mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
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
    .mat-column-motivo_rechazo {
      min-width: 200px;
      max-width: 300px;
      padding-right: 16px;
    }
    .motivo-rechazo-cell {
      white-space: normal;
      word-wrap: break-word;
    }
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-mdc-cell {
      padding: 8px 16px;
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
    .mat-column-ticketGruman {
      min-width: 100px;
    }
    .hide-hint ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class SolicitudesRechazadasComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'logo',
    'cliente',
    'local',
    'ticketGruman',
    'fechaIngreso',
    'especialidad',
    'observaciones',
    'motivo_rechazo'
  ];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadSolicitudes();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.ticketGruman?.toLowerCase().includes(filter);
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSolicitudes() {
    this.solicitarVisitaService.getSolicitudesRechazadas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando solicitudes rechazadas:', error);
      }
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/transacciones/solicitudes-de-visita', id]);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.png'; // Imagen por defecto si falla la carga
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
} 