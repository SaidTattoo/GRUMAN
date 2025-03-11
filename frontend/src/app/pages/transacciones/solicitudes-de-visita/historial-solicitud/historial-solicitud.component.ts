import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-historial-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="cardWithShadow">
      <mat-card-header>
        <mat-card-title>
          Historial de la Solicitud #{{solicitudId}}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="timeline">
          @for (evento of historial; track evento.id) {
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="version-header">
                <h3>{{evento.tipo}}</h3>
                <span class="version-date">{{evento.fecha | date:'d MMM, y HH:mm':'':'es'}}</span>
              </div>
              <div class="changes-list">
                <div class="change-item">
                  <mat-icon [ngClass]="getIconClass(evento.tipo)">
                    {{getIconForStatus(evento.tipo)}}
                  </mat-icon>
                  <span>{{evento.descripcion}}</span>
                </div>
                @if (evento.usuario) {
                  <div class="change-item">
                    <mat-icon>person</mat-icon>
                    <span>{{evento.usuario}}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary" (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
          Volver
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .timeline-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    mat-card-subtitle {
      margin-top: 8px !important;
      color: #666;
    }

    .timeline {
      position: relative;
      padding: 20px 0;
      margin-left: 20px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 9px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      padding-left: 40px;
      padding-bottom: 24px;
      min-height: min-content;

      &:last-child {
        padding-bottom: 0;
      }

      &:not(:last-child) {
        margin-bottom: calc(12px + 1vh);
      }
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #1e88e5;
      z-index: 1;
    }

    .version-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;

      h3 {
        margin: 0;
        color: #1e88e5;
        font-size: 1.2em;
        font-weight: 500;
        margin-right: 12px;
      }

      .version-date {
        color: #666;
        font-size: 0.9em;
      }
    }

    .changes-list {
      padding-left: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .change-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      mat-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      span {
        font-size: 0.95em;
        line-height: 1.4;
        flex: 1;
      }
    }

    .status-created { color: #4CAF50; }
    .status-modified { color: #2196F3; }
    .status-validated { color: #FF9800; }
    .status-approved { color: #4CAF50; }
    .status-rejected { color: #F44336; }
    .status-reopened { color: #9C27B0; }

    @media (max-width: 600px) {
      .timeline-item {
        padding-left: 32px;
        padding-bottom: 20px;
      }

      .timeline-dot {
        width: 16px;
        height: 16px;
      }

      .version-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .version-date {
          margin-left: 0;
        }
      }
    }

    :host {
      display: block;
      padding: 20px;
    }

    mat-card {
      margin-bottom: 24px;
    }
  `]
})
export class HistorialSolicitudComponent implements OnInit {
  historial: any[] = [];
  solicitudId: number = 0;
  timelineEvents: any[] = [];

  constructor(
    private solicitarVisitaService: SolicitarVisitaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.solicitudId = params['id'];
      this.cargarHistorial();
    });
  }

  cargarHistorial() {
    this.solicitarVisitaService.getSolicitudVisita(this.solicitudId).subscribe({
      next: (data) => {
        this.processTimelineEvents(data);
      },
      error: (error) => {
        console.error('Error al cargar el historial:', error);
      }
    });
  }

  processTimelineEvents(data: any) {
    this.timelineEvents = [];

    // Fecha de ingreso
    if (data.fechaIngreso) {
      this.timelineEvents.push({
        tipo: 'Ingreso de solicitud',
        fecha: data.fechaIngreso,
        descripcion: 'Se ingresó la solicitud al sistema',
        usuario: data.generada_por_id ? 'Usuario ID: ' + data.generada_por_id : 'Sistema'
      });
    }

    // Fecha de visita programada
    if (data.fechaVisita) {
      this.timelineEvents.push({
        tipo: 'Visita programada',
        fecha: data.fechaVisita,
        descripcion: `Visita programada con el técnico ${data.tecnico_asignado?.name} ${data.tecnico_asignado?.lastName}`,
        usuario: data.tecnico_asignado?.name + ' ' + data.tecnico_asignado?.lastName
      });
    }

    // Fecha de validación
    if (data.fecha_hora_validacion) {
      this.timelineEvents.push({
        tipo: 'Validación',
        fecha: data.fecha_hora_validacion,
        descripcion: 'Solicitud validada',
        usuario: data.validada_por_id ? 'Usuario ID: ' + data.validada_por_id : 'Sistema'
      });
    }

    // Fecha de inicio de servicio
    if (data.fecha_hora_inicio_servicio) {
      this.timelineEvents.push({
        tipo: 'Inicio de servicio',
        fecha: data.fecha_hora_inicio_servicio,
        descripcion: 'Se inició el servicio',
        usuario: data.tecnico_asignado?.name + ' ' + data.tecnico_asignado?.lastName
      });
    }

    // Fecha de fin de servicio
    if (data.fecha_hora_fin_servicio) {
      this.timelineEvents.push({
        tipo: 'Fin de servicio',
        fecha: data.fecha_hora_fin_servicio,
        descripcion: 'Se finalizó el servicio',
        usuario: data.tecnico_asignado?.name + ' ' + data.tecnico_asignado?.lastName
      });
    }

    // Fecha de aprobación
    if (data.fecha_hora_aprobacion) {
      this.timelineEvents.push({
        tipo: 'Aprobación',
        fecha: data.fecha_hora_aprobacion,
        descripcion: 'Solicitud aprobada',
        usuario: data.aprobada_por_id ? 'Usuario ID: ' + data.aprobada_por_id : 'Sistema'
      });
    }

    // Ordenar eventos por fecha
    this.timelineEvents.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    this.historial = this.timelineEvents;
  }

  getIconForStatus(tipo: string): string {
    const iconMap: { [key: string]: string } = {
      'creada': 'add_circle',
      'modificada': 'edit',
      'validada': 'check_circle',
      'aprobada': 'done_all',
      'rechazada': 'cancel',
      'reabierta': 'refresh'
    };
    return iconMap[tipo.toLowerCase()] || 'info';
  }

  getIconClass(tipo: string): string {
    const classMap: { [key: string]: string } = {
      'creada': 'status-created',
      'modificada': 'status-modified',
      'validada': 'status-validated',
      'aprobada': 'status-approved',
      'rechazada': 'status-rejected',
      'reabierta': 'status-reopened'
    };
    return classMap[tipo.toLowerCase()] || '';
  }

  volver() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
} 