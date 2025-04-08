import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-busqueda-global',
  standalone: true,
  imports: [CommonModule, MaterialModule, HighlightPipe],
  template: `
    @if (searchTerm?.trim()) {
      <div class="container-fluid">
        <mat-card class="cardWithShadow">
          <mat-card-content>
            <div class="row mb-4">
              <div class="col-12">
                @if (searchTerm) {
                  <h2>Resultados de búsqueda para: "{{searchTerm}}"</h2>
                  @if (selectedCompany && selectedCompany.nombre !== 'GRUMAN') {
                    <h4 class="text-muted">Filtrando resultados para: {{selectedCompany.nombre}}</h4>
                  }
                } @else {
                  <h2>Búsqueda Global</h2>
                }
              </div>
            </div>

            @if (isLoading) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Buscando solicitudes...</p>
              </div>
            }

            @if (error) {
              <div class="error-container">
                <mat-icon color="warn">error_outline</mat-icon>
                <p>{{ error }}</p>
                <div class="error-actions">
                  <button mat-raised-button color="primary" (click)="buscar()">
                    <mat-icon>refresh</mat-icon> Intentar nuevamente
                  </button>
                  <button mat-button color="warn" (click)="limpiarBusqueda()">
                    <mat-icon>clear</mat-icon> Limpiar búsqueda
                  </button>
                </div>
              </div>
            }

            <div class="table-responsive" [class.loading-overlay]="isLoading">
              <table mat-table [dataSource]="solicitudesDataSource" matSort class="w-100">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> N° Solicitud </th>
                  <td mat-cell *matCellDef="let element" [innerHTML]="element.id.toString() | highlight: searchTerm"></td>
                </ng-container>

                <ng-container matColumnDef="cliente">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Cliente </th>
                  <td mat-cell *matCellDef="let element" [innerHTML]="(element.client?.nombre || element.cliente) | highlight: searchTerm"></td>
                </ng-container>

                <ng-container matColumnDef="local">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Local </th>
                  <td mat-cell *matCellDef="let element" [innerHTML]="element.local?.nombre_local | highlight: searchTerm"></td>
                </ng-container>

                <ng-container matColumnDef="direccion">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Dirección </th>
                  <td mat-cell *matCellDef="let element" [innerHTML]="element.local?.direccion | highlight: searchTerm"></td>
                </ng-container>

                <ng-container matColumnDef="fecha">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha </th>
                  <td mat-cell *matCellDef="let element"> {{element.fechaVisita | date:'dd/MM/yyyy'}} </td>
                </ng-container>

                <ng-container matColumnDef="tecnico">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Técnico </th>
                  <td mat-cell *matCellDef="let element">
                    <div [innerHTML]="getTecnicoNombre(element) | highlight: searchTerm"></div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
                  <td mat-cell *matCellDef="let element">
                    <span [class]="getEstadoClass(element.status)">
                      {{getEstadoLabel(element.status)}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef> Acciones </th>
                  <td mat-cell *matCellDef="let element" (click)="$event.stopPropagation()">
                    <button mat-icon-button color="primary" 
                            (click)="verDetalle(element)"
                            matTooltip="Ver detalle">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    class="hover-row"
                    (click)="verDetalle(row)"></tr>

                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" colspan="8" style="text-align: center; padding: 2rem;">
                    @if (isLoading) {
                      Buscando...
                    } @else if (!searchTerm) {
                      Ingrese un término en el buscador para comenzar
                    } @else {
                      No se encontraron resultados para "{{searchTerm}}"
                      @if (selectedCompany && selectedCompany.nombre !== 'GRUMAN') {
                        en {{selectedCompany.nombre}}
                      }
                    }
                  </td>
                </tr>
              </table>

              @if (solicitudesDataSource.data.length > 0) {
                <mat-paginator 
                  #paginator
                  [pageSize]="5"
                  [pageSizeOptions]="[5, 10, 25, 100]"
                  [showFirstLastButtons]="true"
                  [length]="totalItems"
                  aria-label="Seleccionar página">
                </mat-paginator>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .container-fluid {
      padding: 20px;
    }
    .table-responsive {
      margin-top: 20px;
      position: relative;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .loading-container p {
      margin-top: 1rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .loading-overlay {
      opacity: 0.6;
      pointer-events: none;
    }
    .mat-mdc-table {
      width: 100%;
      background: white;
    }
    .hover-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    .mat-column-acciones {
      width: 80px;
      text-align: center;
    }
    .estado-pendiente {
      color: #ff9800;
      font-weight: 500;
    }
    .estado-aprobada {
      color: #2196F3;
      font-weight: 500;
    }
    .estado-rechazada {
      color: #f44336;
      font-weight: 500;
    }
    .estado-validada {
      color: #4CAF50;
      font-weight: 500;
    }
    .estado-finalizada {
      color: #9C27B0;
      font-weight: 500;
    }
    .search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input {
  position: relative;
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #666;
}

.spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

::ng-deep .highlight-text {
  background-color: #fff59d;
  font-weight: bold;
  padding: 2px;
  border-radius: 2px;
}

.mat-cell {
  color: rgba(0, 0, 0, 0.7);
  font-size: 1rem;
}

.no-search-message {
  text-align: center;
  padding: 2rem;
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.1rem;
}
  `]
})
export class BusquedaGlobalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'cliente', 'local', 'direccion', 'fecha', 'tecnico', 'estado', 'acciones'];
  solicitudesDataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchTerm = '';
  totalItems = 0;
  error: string | null = null;
  selectedCompany: any = null;
  private userSubscription: Subscription;
  private searchResults: any[] = []; // Almacenar resultados sin filtrar

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitarVisitaService: SolicitarVisitaService,
    private snackBar: MatSnackBar,
    private storage: StorageService
  ) {
    this.userSubscription = this.storage.user$.subscribe(user => {
      const newSelectedCompany = user?.selectedCompany;
      if (this.selectedCompany?.id !== newSelectedCompany?.id) {
        this.selectedCompany = newSelectedCompany;
        this.updateFilteredResults();
      }
    });
  }

  ngOnInit() {
    const currentUser = this.storage.getItem('currentUser');
    this.selectedCompany = currentUser?.selectedCompany || null;

    this.route.queryParams.subscribe(params => {
      const term = params['q'] || '';
      this.searchTerm = this.sanitizeSearchTerm(term);
      if (this.searchTerm) {
        this.buscar();
      } else {
        this.solicitudesDataSource.data = [];
        this.totalItems = 0;
      }
    });
  }

  ngAfterViewInit() {
    this.solicitudesDataSource.paginator = this.paginator;
    this.solicitudesDataSource.sort = this.sort;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateFilteredResults() {
    if (!this.searchResults.length) return;

    if (this.selectedCompany && this.selectedCompany.nombre !== 'GRUMAN') {
      const filteredResults = this.searchResults.filter(item => 
        item.client?.id === this.selectedCompany.id || 
        item.clientId === this.selectedCompany.id
      );
      this.solicitudesDataSource.data = filteredResults;
      this.totalItems = filteredResults.length;
    } else {
      this.solicitudesDataSource.data = this.searchResults;
      this.totalItems = this.searchResults.length;
    }

    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  sanitizeSearchTerm(term: string): string {
    return term.trim()
              .replace(/[^\w\sñÑáéíóúÁÉÍÓÚ]/gi, '') // Permitir caracteres especiales españoles
              .replace(/\s+/g, ' ');
  }

  limpiarBusqueda() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null },
      queryParamsHandling: 'merge'
    });
    this.searchTerm = '';
    this.solicitudesDataSource.data = [];
    this.error = null;
  }

  buscar() {
    if (!this.searchTerm?.trim()) {
      this.solicitudesDataSource.data = [];
      this.totalItems = 0;
      return;
    }
    
    this.isLoading = true;
    this.error = null;

    const searchTerm = this.sanitizeSearchTerm(this.searchTerm);

    if (!searchTerm) {
      this.error = 'Por favor, ingrese un término de búsqueda válido.';
      this.isLoading = false;
      return;
    }

    this.solicitarVisitaService.buscarSolicitud(searchTerm)
      .pipe(
        catchError(error => {
          console.error('Error al buscar solicitudes:', error);
          if (error.code === 'ER_PARSE_ERROR') {
            this.error = 'El término de búsqueda contiene caracteres no válidos. Por favor, intente con una búsqueda más simple.';
          } else {
            this.error = 'Hubo un error al realizar la búsqueda. Por favor, intente con otros términos o contacte al administrador.';
          }
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response && Array.isArray(response)) {
            this.searchResults = response; // Guardar resultados sin filtrar
            this.updateFilteredResults(); // Aplicar filtros según la compañía seleccionada
          } else {
            this.error = 'La respuesta del servidor no tiene el formato esperado.';
          }
        }
      });
  }

  verDetalle(solicitud: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/modificar', solicitud.id]);
  }

  getEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'validada': 'Validada',
      'finalizada': 'Finalizada',
      'reabierta': 'Reabierta'
    };
    return estados[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado?.toLowerCase()}`;
  }

  getTecnicoNombre(element: any): string {
    const tecnico1 = element.tecnico_asignado 
      ? `${element.tecnico_asignado.name} ${element.tecnico_asignado.lastName}`.trim()
      : '';
    
    const tecnico2 = element.tecnico_asignado_2
      ? `${element.tecnico_asignado_2.name} ${element.tecnico_asignado_2.lastName}`.trim()
      : '';
    
    if (tecnico1 && tecnico2) {
      return `${tecnico1}, ${tecnico2}`;
    } else if (tecnico1) {
      return tecnico1;
    } else if (tecnico2) {
      return tecnico2;
    }
    return 'Sin asignar';
  }
} 