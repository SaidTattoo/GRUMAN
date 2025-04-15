import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { StorageService } from '../../services/storage.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-busqueda-global',
  templateUrl: './busqueda-global.component.html',
  styleUrls: ['./busqueda-global.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    HighlightPipe,
    MatTableModule,
    MatPaginatorModule
  ]
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
  searchParams: string[] = [];
  results: any[] = [];

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
      if (params['q']) {
        this.searchParams = params['q'].split(',').map((term: string) => term.trim());
        this.performSearch();
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
    let filteredResults = [...this.searchResults];
    
    if (this.selectedCompany && this.selectedCompany.nombre !== 'GRUMAN') {
      filteredResults = filteredResults.filter(
        solicitud => solicitud.client?.id === this.selectedCompany.id
      );
    }

    this.solicitudesDataSource.data = filteredResults;
    this.totalItems = filteredResults.length;

    if (this.solicitudesDataSource.paginator) {
      this.solicitudesDataSource.paginator.firstPage();
    }
  }

  sanitizeSearchTerm(term: string): string {
    if (!term) return '';
    // Eliminar caracteres especiales y espacios múltiples
    return term.trim()
      .replace(/[^\w\s]/gi, '')
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
    this.searchParams = [];
    this.results = [];
    this.error = null;
  }

  performSearch() {
    this.isLoading = true;
    this.error = null;

    if (!this.searchParams || this.searchParams.length === 0) {
      this.isLoading = false;
      this.solicitudesDataSource.data = [];
      return;
    }

    // Limpiar y validar parámetros de búsqueda
    const validParams = this.searchParams
      .map(param => this.sanitizeSearchTerm(param))
      .filter(param => param.length > 0);

    if (validParams.length === 0) {
      this.isLoading = false;
      this.solicitudesDataSource.data = [];
      return;
    }

    this.solicitarVisitaService.buscarSolicitud(validParams).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.updateFilteredResults();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.error = error.message || 'Error al realizar la búsqueda. Por favor, intente nuevamente.';
        this.isLoading = false;
        this.solicitudesDataSource.data = [];
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
    return estados[estado?.toLowerCase()] || estado;
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

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Pendiente': '#FFA726',
      'En Proceso': '#42A5F5',
      'Completada': '#66BB6A',
      'Cancelada': '#EF5350'
    };
    return colors[status] || '#757575';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  buscar() {
    this.performSearch();
  }
} 