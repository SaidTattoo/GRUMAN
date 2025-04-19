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
  `]
})
export class SolicitudesDeVisitaComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'id',
    'fechaIngreso',	
    'logo',
    'cliente',
    'local',
    'ticketGruman',
    'observaciones',
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

  verSolicitud(element: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/ver-solicitud/pendiente', element.id]);
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
}

