import { Component, OnInit, ViewChild } from '@angular/core';
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
  `]
})
export class SolicitudesDeVisitaComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'logo',
    'cliente',
    'local',
    'ticketGruman',
    'observaciones',
    'estado',
    'imagenes',
    'acciones'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private solicitarVisitaService: SolicitarVisitaService, 
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
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
    this.solicitarVisitaService.getSolicitudesVisita().subscribe({
      next: (data: any) => {
        this.dataSource.data = data.filter((solicitud: any) => solicitud.status === 'pendiente');
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
      }
    });
  }

  verSolicitud(element: any) {
    this.router.navigate(['/transacciones/solicitudes-de-visita/ver-solicitud', element.id]);
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

