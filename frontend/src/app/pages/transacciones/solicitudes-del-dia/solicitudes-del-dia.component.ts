import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';

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
    MatInputModule
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
  displayedColumns: string[] = ['id', 'cliente', 'local', 'tipoServicio', 'tipo_mantenimiento', 'estado', 'tecnico' ];
  dataSource: any[] = [];

  constructor(private solicitarVisitaService: SolicitarVisitaService) {}

  ngOnInit() {
    this.cargarSolicitudesDelDia();
  }

  cargarSolicitudesDelDia() {
    console.log('[Component] Iniciando carga de solicitudes del día');
    this.solicitarVisitaService.getSolicitudesDelDia().subscribe({
      next: (response: any) => {
        console.log('[Component] Datos recibidos:', response);
        // Verificamos si la respuesta tiene la estructura esperada
        if (response && response.success) {
          this.dataSource = response.data || [];
        } else if (Array.isArray(response)) {
          // Si la respuesta es directamente un array
          this.dataSource = response;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implementar la lógica de filtrado según tus necesidades
  }
} 