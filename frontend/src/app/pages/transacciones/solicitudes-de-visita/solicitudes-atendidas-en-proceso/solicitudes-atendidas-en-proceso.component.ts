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
    MatSortModule
  ],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <div class="row justify-content-between m-b-8">
          <div class="col-sm-4 col-lg-3">
            <mat-form-field appearance="outline" class="w-100 hide-hint">
              <input matInput (keyup)="applyFilter($event)" placeholder="Buscar" #input />
            </mat-form-field>
          </div>
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
} 