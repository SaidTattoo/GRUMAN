import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { UsersService } from 'src/app/services/users.service';
import Swal from 'sweetalert2';
import { VerImagenesComponent } from '../ver-imagenes/ver-imagenes.component';
import { MatDialog } from '@angular/material/dialog';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { SectoresService } from 'src/app/services/sectores.service';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ver-solicitud',
  standalone: true,
  imports: [ 
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatTooltipModule,
    MatDividerModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule 
    ,
  /*   ActivityImagesComponent,
    ActivityLocationComponent,
    ActivityDetailsComponent */
  ],
  templateUrl: './ver-solicitud.component.html',
  styleUrl: './ver-solicitud.component.scss'
})
export class VerSolicitudComponent implements OnInit {
  @Input() activity!: any;
  tiposServicio: any[] = [];
  tecnicos: any[] = [];
  sectores: any[] = [];
  especialidades: any[] = [];
  minDate = new Date(); // Fecha mínima será hoy

  constructor(
    private route: ActivatedRoute, 
    private solicitarVisitaService: SolicitarVisitaService, 
    private router: Router, 
    private dialog: MatDialog, 
    private tipoServicioService: TipoServicioService,
    private usersService: UsersService,
    private sectoresService: SectoresService,
    private especialidadesService: EspecialidadesService,
    private snackBar: MatSnackBar
  ) {}

  getStatusClass(): string {
    return `status-${this.activity.status.toLowerCase()}`;
  }
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.solicitarVisitaService.getSolicitudVisita(id).subscribe({
      next: (data: any) => {
        console.log('Solicitud cargada:', data);
        this.activity = data;
        this.loadTiposServicio();
        this.loadTecnicos();
        this.loadSectores();
        this.loadEspecialidades();
      },
      error: (error) => {
        console.error('Error cargando la solicitud:', error);
        Swal.fire('Error', 'No se pudo cargar la solicitud', 'error');
        this.router.navigate(['/transacciones/solicitudes-de-visita/validadas']);
      }
    });
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
    openImageDialog(imageUrl: string): void {
      this.dialog.open(VerImagenesComponent, {
        data: { imageUrl },
        maxWidth: '95vw',
        maxHeight: '95vh',
        panelClass: 'image-dialog',
        autoFocus: false
      });
  
  }
  rejectActivity() {
    Swal.fire({
      title: '¿Está seguro de rechazar esta solicitud?',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ingrese el motivo del rechazo...',
      inputAttributes: {
        'aria-label': 'Ingrese el motivo del rechazo'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar un motivo para el rechazo';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updateData = {
          status: 'rechazado',
          observacion_rechazo: result.value
        };

        this.solicitarVisitaService.updateSolicitudVisita(this.activity.id, updateData).subscribe({
          next: (response) => {
            this.activity = response;
            Swal.fire('Éxito', 'Solicitud rechazada correctamente', 'success');
            this.router.navigate(['/transacciones/solicitudes-de-visita/rechazadas']);
          },
          error: (error) => {
            console.error('Error al rechazar la solicitud:', error);
            Swal.fire('Error', 'No se pudo rechazar la solicitud', 'error');
          }
        });
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/transacciones/solicitudes-de-visita/validadas']);
  }
  loadTiposServicio() {
    this.tipoServicioService.findAll().subscribe({
      next: (tipos) => {
        this.tiposServicio = tipos;
      },
      error: (error) => {
        console.error('Error cargando tipos de servicio:', error);
      }
    });
  }
  getTipoServicioNombre(id: number): string {
    const tipoServicio = this.tiposServicio.find(tipo => tipo.id === id);
    return tipoServicio ? tipoServicio.nombre : 'No especificado';
  }
  loadTecnicos() {
    this.usersService.getAllTecnicos().subscribe({
      next: (data: any[]) => {
        console.log('Técnicos cargados:', data);
        
        const matching = data.filter(t => this.hasMatchingSpecialty(t))
          .sort((a, b) => (a.name + ' ' + a.lastName)
            .localeCompare(b.name + ' ' + b.lastName));
            
        const nonMatching = data.filter(t => !this.hasMatchingSpecialty(t))
          .sort((a, b) => (a.name + ' ' + a.lastName)
            .localeCompare(b.name + ' ' + b.lastName));
        
        this.tecnicos = [...matching, ...nonMatching];
        console.log('Técnicos ordenados:', this.tecnicos);
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
        Swal.fire('Error', 'No se pudieron cargar los técnicos', 'error');
      }
    });
  }
  approveActivity() {
    if (!this.activity.tecnico_asignado_id) {
      Swal.fire('Error', 'Debe asignar un técnico antes de aprobar la solicitud', 'error');
      return;
    }

    Swal.fire({
      title: '¿Está seguro de aprobar esta solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitarVisitaService.updateSolicitudVisita(this.activity.id, {
          especialidad: this.activity.especialidad,
          sectorTrabajoId: this.activity.sectorTrabajoId,
          tipoServicioId: this.activity.tipoServicioId,
          tecnico_asignado_id: this.activity.tecnico_asignado_id,
          observaciones: this.activity.observaciones,
          fechaVisita: this.activity.fechaVisita
        }).subscribe({
          next: () => {
            this.solicitarVisitaService.aprobarSolicitudVisita(this.activity.id).subscribe({
              next: (response) => {
                this.activity = response;
                Swal.fire('Éxito', 'Solicitud aprobada correctamente', 'success');
                this.router.navigate(['/transacciones/solicitudes-de-visita/aprobadas']);
              },
              error: (error) => {
                console.error('Error al aprobar la solicitud:', error);
                Swal.fire('Error', 'No se pudo aprobar la solicitud', 'error');
              }
            });
          },
          error: (error) => {
            console.error('Error al actualizar los campos:', error);
            Swal.fire('Error', 'No se pudieron actualizar los campos', 'error');
          }
        });
      }
    });
  }
  hasMatchingSpecialty(tecnico: any): boolean {
    if (!this.activity?.especialidad) return false;
    
    return tecnico.especialidades?.some(
      (esp: any) => esp.nombre?.toLowerCase() === this.activity?.especialidad?.toLowerCase()
    ) || false;
  }
  loadSectores() {
    this.sectoresService.getSectores().subscribe({
      next: (data) => {
        this.sectores = data;
      },
      error: (error) => {
        console.error('Error cargando sectores:', error);
      }
    });
  }
  getSectorNombre(id: number): string {
    const sector = this.sectores.find(s => s.id === id);
    return sector ? sector.nombre : 'No especificado';
  }
  loadEspecialidades() {
    this.especialidadesService.findAll().subscribe({
      next: (data) => {
        this.especialidades = data;
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
      }
    });
  }
  asignarTecnico(event: any) {
    const tecnicoId = event.value;
    if (!tecnicoId) {
      this.activity.tecnico_asignado_id = null;
    } else {
      this.activity.tecnico_asignado_id = tecnicoId;
    }
  }
  getSelectedTecnicoName(): string {
    const tecnico = this.getTecnicoById(this.activity.tecnico_asignado_id);
    return tecnico ? `${tecnico.name} ${tecnico.lastName}` : '';
  }

  getTecnicoById(id: number): any {
    return this.tecnicos.find(t => t.id === id);
  }

  onFechaVisitaChange(event: any) {
    if (this.activity) {
      this.activity.fechaVisita = event.value;
    }
  }
}
