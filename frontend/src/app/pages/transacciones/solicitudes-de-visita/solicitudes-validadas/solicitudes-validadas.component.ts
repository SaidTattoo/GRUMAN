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
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-content class="p-24">
        <div class="row justify-content-between m-b-8">
          <div class="col-sm-8">
            <h2 class="m-0">Solicitudes Validadas</h2>
          
          </div>
          <div class="col-sm-4">
            <mat-form-field appearance="outline" class="w-100 hide-hint">
              <mat-label>Buscar</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Buscar solicitud" #input>
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Indicador de carga -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando solicitudes...</p>
        </div>

        <!-- Tabla de datos o mensaje cuando no hay datos -->
        <div *ngIf="!loading" class="m-t-16">
          <!-- Mensaje cuando no hay datos -->
          <div *ngIf="dataSource.data.length === 0" class="no-data-message">
            <mat-icon>event_busy</mat-icon>
            <p>No hay solicitudes validadas para mostrar</p>
        
            <p class="text-muted">Las solicitudes validadas aparecerán aquí cuando estén disponibles</p>
          </div>

          <!-- Tabla con datos -->
          <div *ngIf="dataSource.data.length > 0" class="table-responsive">
            <table mat-table [dataSource]="dataSource" matSort class="w-100 mat-elevation-z8">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Número de solicitud</th>
                <td mat-cell *matCellDef="let row">{{row.id}}</td>
              </ng-container>

             

              <!-- Fecha Column -->
              <ng-container matColumnDef="fechaIngreso">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Ingreso</th>
                <td mat-cell *matCellDef="let row">{{row.fechaIngreso  | date:'dd/MM/yyyy '}}</td>
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

              <!-- Ticket Column -->
              <ng-container matColumnDef="ticketGruman">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Ticket</th>
                <td mat-cell *matCellDef="let row">{{row.ticketGruman || 'Sin ticket'}}</td>
              </ng-container>
              <ng-container matColumnDef="generado_por">
                <th mat-header-cell *matHeaderCellDef>Generado por</th>
                <td mat-cell *matCellDef="let row">  {{row.generada_por ? (row.generada_por.name + ' ' + row.generada_por.lastName) : 'Sin usuario'}}</td>
              </ng-container>
              <ng-container matColumnDef="validada_por">
                <th mat-header-cell *matHeaderCellDef>Validada por</th>
                <td mat-cell *matCellDef="let row"> {{row.validada_por ? (row.validada_por.name + ' ' + row.validada_por.lastName) : 'Sin usuario'}}</td>
              </ng-container>
              <ng-container matColumnDef="fecha_hora_validacion">
                <th mat-header-cell *matHeaderCellDef>Fecha y hora validación</th>
                <td mat-cell *matCellDef="let row">{{row.fecha_hora_validacion  | date:'dd/MM/yyyy HH:mm'}} </td>
              </ng-container>
              <!-- Especialidad Column -->
              <ng-container matColumnDef="especialidad">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Especialidad</th>
                <td mat-cell *matCellDef="let row">
                  {{especialidades[row.especialidad] || 'No especificada'}}
                </td>
              </ng-container>

              <!-- Observaciones Column -->
              <ng-container matColumnDef="observaciones">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Observaciones</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.observaciones?.length > 100 ? (row.observaciones | slice:0:50) + '...' : row.observaciones }}
                </td>
              </ng-container>

              <!-- Técnico Column -->
              <ng-container matColumnDef="tecnico">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Técnico</th>
                <td mat-cell *matCellDef="let row">
                  {{row.tecnico_asignado ? row.tecnico_asignado.name + ' ' + row.tecnico_asignado.lastName : 'No asignado'}}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip-listbox>
                    <mat-chip [ngClass]="{
                      'bg-warning': row.status === 'reabierta',
                      'bg-success': row.status === 'validada'
                    }">
                      {{row.status === 'reabierta' ? 'Reabierta' : 'Validada'}}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="primary" (click)="verDetalle(row.id); $event.stopPropagation()" matTooltip="Ver detalle">
                    <mat-icon>visibility</mat-icon>
                  </button>
                <!--   <button mat-icon-button 
                          color="primary" 
                          (click)="verHistorial(row); $event.stopPropagation()"
                          matTooltip="Ver historial"
                          matTooltipPosition="above"
                          matTooltipShowDelay="500">
                    <mat-icon>history</mat-icon>
                  </button> -->
                  <button  mat-icon-button 
                           color="primary" 
                           (click)="reabrirSolicitud(row); $event.stopPropagation()" 
                           matTooltip="Reabrir solicitud"
                           matTooltipPosition="above"
                           matTooltipShowDelay="500"
                           [disabled]="row.status === 'reabierta'"
                           [matTooltip]="row.status === 'reabierta' ? 'Solicitud ya reabierta' : 'Reabrir solicitud'">
                    <mat-icon>open_in_browser</mat-icon>
                  </button>
                  <button mat-icon-button 
                         color="accent"
                         *ngIf="row.status === 'reabierta'"
                         (click)="editarSolicitud(row); $event.stopPropagation()"
                         matTooltip="Editar solicitud"
                         matTooltipPosition="above"
                         matTooltipShowDelay="500">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="verDetalle(row.id)"></tr>
              
              <!-- Row shown when there is no matching data from filter -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="11">
                  <div class="no-data-message">
                    <mat-icon>search_off</mat-icon>
                    <p>No se encontraron coincidencias para "{{input.value}}"</p>
                    <p class="text-muted">Intenta con otros términos de búsqueda</p>
                  </div>
                </td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                          [pageSize]="10"
                          aria-label="Seleccionar página">
            </mat-paginator>
          </div>
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
      width: 120px;
      text-align: center;
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
      cursor: pointer;
    }
    .mat-mdc-cell {
      padding: 8px 16px;
    }
    .mat-column-ticketGruman {
      min-width: 100px;
    }
    .hide-hint ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    .bg-warning {
      background-color: #ffc107 !important;
      color: #ffffff !important;
    }
    .bg-success {
      background-color: #28a745 !important;
      color: #ffffff !important;
    }
    .mat-mdc-chip {
      color: #ffffff !important;
    }
    .mat-column-status {
      width: 120px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
    }
    .loading-container p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.6);
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
    .no-data-message p:first-of-type {
      font-size: 18px;
      color: rgba(0, 0, 0, 0.8);
    }
    .text-muted {
      color: rgba(0, 0, 0, 0.6);
    }
  `]
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
} 