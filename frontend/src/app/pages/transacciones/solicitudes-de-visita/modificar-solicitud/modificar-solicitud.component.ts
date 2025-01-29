import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { TipoServicioService } from '../../../../services/tipo-servicio.service';
import { SectoresService } from '../../../../services/sectores.service';
import { MatCardContent, MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-modificar-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCardContent,
    MatTableModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './modificar-solicitud.component.html',
  styleUrls: ['./modificar-solicitud.component.scss']
})
export class ModificarSolicitudComponent implements OnInit {
  solicitudId: string;
  solicitudForm: FormGroup;
  solicitud: any;
  loading = false;
  tipoServicio: any;
  sectorTrabajo: any;
  especialidades: string[] = [
    'Electricidad',
    'Climatización',
    'Refrigeración',
    'Mecánica',
    'Plomería',
    'Carpintería',
    'Albañilería',
    'Pintura',
    'Otros'
  ];
  displayedColumns: string[] = ['id', 'itemId', 'comentario', 'cantidad', 'fechaAgregado'];
  itemRepuestos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private solicitarVisitaService: SolicitarVisitaService,
    private tipoServicioService: TipoServicioService,
    private sectoresService: SectoresService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.solicitudForm = this.fb.group({
      tipoServicioId: [{value: '', disabled: true}],
      sectorTrabajoId: [{value: '', disabled: true}],
      especialidad: [''],
      fechaIngreso: [{value: '', disabled: true}],
      ticketGruman: [''],
      observaciones: [''],
      status: [{value: '', disabled: true}],
      tecnico_asignado_id: [{value: '', disabled: true}],
      fecha_hora_inicio_servicio: [{value: '', disabled: true}],
      fecha_hora_fin_servicio: [{value: '', disabled: true}],
      longitud_movil: [''],
      latitud_movil: [''],
      // Campos adicionales de solo lectura
      'local.nombre_local': [{value: '', disabled: true}],
      'local.direccion': [{value: '', disabled: true}],
      'client.nombre': [{value: '', disabled: true}],
      'tecnico_asignado.name': [{value: '', disabled: true}]
    });
  }

  ngOnInit() {
    this.solicitudId = this.route.snapshot.params['id'];
    console.log('Especialidades disponibles:', this.especialidades);
    this.loadSolicitud();
  }

  loadSolicitud() {
    this.loading = true;
    console.log('Loading solicitud...');
    this.solicitarVisitaService.getSolicitudVisita(Number(this.solicitudId)).subscribe({
      next: (data) => {
        console.log('Solicitud data received:', data);
        this.solicitud = data;
        this.itemRepuestos = data.itemRepuestos || [];
        
        // Get tipo servicio name
        this.tipoServicioService.findById(data.tipoServicioId).subscribe({
          next: (tipoServicio) => {
            this.tipoServicio = tipoServicio;
            this.solicitudForm.patchValue({
              tipoServicioId: tipoServicio.nombre
            });
          },
          error: (error) => {
            console.error('Error al cargar el tipo de servicio:', error);
          }
        });

        // Get sector trabajo name
        this.sectoresService.findOne(data.sectorTrabajoId).subscribe({
          next: (sector) => {
            this.sectorTrabajo = sector;
            this.solicitudForm.patchValue({
              sectorTrabajoId: sector.nombre
            });
          },
          error: (error) => {
            console.error('Error al cargar el sector de trabajo:', error);
          }
        });

        // Ensure especialidad is in the list of valid options
        if (data.especialidad && !this.especialidades.includes(data.especialidad)) {
          console.warn('Especialidad value not in list:', data.especialidad);
          this.especialidades.push(data.especialidad);
        }
        
        // Update rest of the form
        const formValues = {
          especialidad: data.especialidad || '',
          fechaIngreso: new Date(data.fechaIngreso),
          ticketGruman: data.ticketGruman,
          observaciones: data.observaciones,
          status: data.status,
          tecnico_asignado_id: data.tecnico_asignado_id,
          fecha_hora_inicio_servicio: data.fecha_hora_inicio_servicio ? new Date(data.fecha_hora_inicio_servicio) : null,
          fecha_hora_fin_servicio: data.fecha_hora_fin_servicio ? new Date(data.fecha_hora_fin_servicio) : null,
          longitud_movil: data.longitud_movil || '',
          latitud_movil: data.latitud_movil || '',
          'local.nombre_local': data.local?.nombre_local,
          'local.direccion': data.local?.direccion,
          'client.nombre': data.client?.nombre,
          'tecnico_asignado.name': data.tecnico_asignado?.name
        };
        
        console.log('Form values to patch:', formValues);
        this.solicitudForm.patchValue(formValues);
        console.log('Form values after patch:', this.solicitudForm.value);
        console.log('Especialidad control value:', this.solicitudForm.get('especialidad')?.value);
      },
      error: (error) => {
        console.error('Error al cargar la solicitud:', error);
        this.snackBar.open('Error al cargar la solicitud', 'Cerrar', {
          duration: 3000
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/transacciones/solicitudes-de-visita/validadas']);
  }

  onValidate(): void {
    console.log('Iniciando validación...');
    this.authService.currentUser.subscribe(currentUser => {
        if (!currentUser || !currentUser.id) {
            this.snackBar.open('Error: No se pudo obtener el usuario actual', 'Cerrar', {
                duration: 3000
            });
            return;
        }

        // Primero actualizamos los datos del formulario
        const formValues = this.solicitudForm.getRawValue();
        const updateData = {
            especialidad: formValues.especialidad,
            ticketGruman: formValues.ticketGruman,
            observaciones: formValues.observaciones,
            longitud_movil: formValues.longitud_movil,
            latitud_movil: formValues.latitud_movil
        };

        // Actualizar primero los datos del formulario
        this.solicitarVisitaService.updateSolicitudVisita(Number(this.solicitudId), updateData)
            .subscribe({
                next: () => {
                    // Una vez actualizado, procedemos a validar
                    const validationData = {
                        validada_por_id: currentUser.id
                    };

                    this.solicitarVisitaService.validarSolicitud(
                        Number(this.solicitudId), 
                        validationData
                    ).subscribe({
                        next: (response) => {
                            console.log('Validación exitosa:', response);
                            this.snackBar.open('Solicitud validada correctamente', 'Cerrar', {
                                duration: 3000
                            });
                            this.router.navigate(['/transacciones/solicitudes-de-visita/validadas']);
                        },
                        error: (error) => {
                            console.error('Error en validación:', error);
                            this.snackBar.open('Error al validar la solicitud', 'Cerrar', {
                                duration: 3000
                            });
                        }
                    });
                },
                error: (error) => {
                    console.error('Error al actualizar la solicitud:', error);
                    this.snackBar.open('Error al actualizar los datos de la solicitud', 'Cerrar', {
                        duration: 3000
                    });
                }
            });
    });
  }
} 