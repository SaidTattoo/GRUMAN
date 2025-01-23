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
  editingObservaciones = false;
  tempObservaciones = '';
  editingFields = false;
  tempEspecialidad = '';
  tempSectorTrabajoId: number | null = null;
  tempTipoServicioId: number | null = null;
  sectores: any[] = [];
  especialidades: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private solicitarVisitaService: SolicitarVisitaService, 
    private router: Router, 
    private dialog: MatDialog, 
    private tipoServicioService: TipoServicioService,
    private usersService: UsersService,
    private sectoresService: SectoresService,
    private especialidadesService: EspecialidadesService
  ) {}

  getStatusClass(): string {
    return `status-${this.activity.status.toLowerCase()}`;
  }
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.solicitarVisitaService.getSolicitudVisita(id).subscribe((data: any) => {
      this.activity = data;
      this.loadTiposServicio();
      this.loadTecnicos();
      this.loadSectores();
      this.loadEspecialidades();
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
  rejectActivity(): void {
    Swal.fire({
      title: '¿Estás seguro de rechazar esta solicitud?',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ingrese el motivo del rechazo...',
      inputAttributes: {
        'aria-label': 'Ingrese el motivo del rechazo'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
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
            this.router.navigate(['/transacciones/solicitudes-de-visita']);
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
    this.router.navigate(['/transacciones/solicitudes-de-visita']);
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
    if (!this.activity?.especialidad) return;
    
    this.usersService.getAllTecnicos().subscribe({
      next: (data: any[]) => {
        // Separar técnicos en dos grupos y ordenar por nombre
        const matching = data.filter(t => this.hasMatchingSpecialty(t))
          .sort((a, b) => a.name.localeCompare(b.name));
        const nonMatching = data.filter(t => !this.hasMatchingSpecialty(t))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        // Combinar los grupos
        this.tecnicos = [...matching, ...nonMatching];
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
      }
    });
  }
  approveActivity() {
    if (!this.activity.tecnico_asignado_id) {
      Swal.fire('Error', 'Debe asignar un técnico antes de aprobar la solicitud', 'error');
      return;
    }

    const updateData = {
      status: 'aprobado',
      especialidad: this.activity.especialidad,
      sectorTrabajoId: this.activity.sectorTrabajoId,
      tipoServicioId: this.activity.tipoServicioId,
      observaciones: this.activity.observaciones,
      tecnico_asignado_id: this.activity.tecnico_asignado_id
    };

    this.solicitarVisitaService.updateSolicitudVisita(this.activity.id, updateData).subscribe({
      next: (response) => {
        this.activity = response;
        Swal.fire('Éxito', 'Solicitud aprobada correctamente', 'success');
        this.router.navigate(['/transacciones/solicitudes-de-visita']);
      },
      error: (error) => {
        console.error('Error al aprobar la solicitud:', error);
        Swal.fire('Error', 'No se pudo aprobar la solicitud', 'error');
      }
    });
  }
  hasMatchingSpecialty(tecnico: any): boolean {
    return tecnico.especialidades?.some(
      (esp: any) => esp.nombre?.toLowerCase() === this.activity?.especialidad?.toLowerCase()
    );
  }
  editarObservaciones() {
    this.tempObservaciones = this.activity.observaciones;
    this.editingObservaciones = true;
  }

  guardarObservaciones() {
    this.solicitarVisitaService.updateSolicitudVisita(this.activity.id, {
      observaciones: this.activity.observaciones
    }).subscribe({
      next: (response) => {
        this.activity = response;
      },
      error: (error) => {
        console.error('Error al actualizar observaciones:', error);
        Swal.fire('Error', 'No se pudieron actualizar las observaciones', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editingObservaciones = false;
    this.tempObservaciones = '';
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

  editarCampos() {
    this.tempEspecialidad = this.activity.especialidad || '';
    this.tempSectorTrabajoId = this.activity.sectorTrabajoId || null;
    this.tempTipoServicioId = this.activity.tipoServicioId || null;
    this.editingFields = true;
  }

  guardarCampos() {
    this.solicitarVisitaService.updateSolicitudVisita(this.activity.id, {
      especialidad: this.activity.especialidad,
      sectorTrabajoId: this.activity.sectorTrabajoId,
      tipoServicioId: this.activity.tipoServicioId
    }).subscribe({
      next: (response) => {
        this.activity = response;
        this.loadTecnicos(); // Recargar técnicos para actualizar coincidencias
      },
      error: (error) => {
        console.error('Error al actualizar campos:', error);
        Swal.fire('Error', 'No se pudieron actualizar los campos', 'error');
      }
    });
  }

  cancelarEdicionCampos() {
    this.editingFields = false;
    this.tempEspecialidad = '';
    this.tempSectorTrabajoId = null;
    this.tempTipoServicioId = null;
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

  // Add new method for technician assignment
  asignarTecnico(event: any) {
    const tecnicoId = event.value;
    
    if (!tecnicoId) {
      return;
    }

    // Actualizar localmente primero
    this.activity.tecnico_asignado_id = tecnicoId;

   
  }
}
