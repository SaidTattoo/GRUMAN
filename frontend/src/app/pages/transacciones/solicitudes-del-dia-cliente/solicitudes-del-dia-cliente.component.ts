import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-solicitudes-del-dia-cliente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './solicitudes-del-dia-cliente.component.html',
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
export class SolicitudesDelDiaClienteComponent implements OnInit {
  displayedColumns: string[] = ['id', 'local', 'tipoServicio','generado_por', 'observaciones', 'estado' ];
  dataSource: any[] = [];

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    const user = this.storageService.getItem('currentUser');
    if (!user?.selectedCompany?.id) {
      console.warn('No hay una compañía seleccionada');
      return;
    }
    this.cargarSolicitudesDelDia();
  }

  cargarSolicitudesDelDia() {
    const user = this.storageService.getCurrentUserWithCompany();
    if (user?.selectedCompany?.id) {
      this.solicitarVisitaService.getSolicitudesDelDiaPorCliente(user.selectedCompany.id).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.dataSource = response.data || [];
          } else {
            console.warn('[Component] Formato de respuesta inesperado:', response);
            this.dataSource = [];
          }
        },
        error: (error) => {
          console.error('[Component] Error al cargar solicitudes:', error);
          this.dataSource = [];
        }
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implementar la lógica de filtrado según tus necesidades
  }
} 