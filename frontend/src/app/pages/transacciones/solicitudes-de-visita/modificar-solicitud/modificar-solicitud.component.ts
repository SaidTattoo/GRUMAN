import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { TipoServicioService } from '../../../../services/tipo-servicio.service';
import { SectoresService } from '../../../../services/sectores.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RepuestosService } from 'src/app/services/repuestos.service';
import { InspectionService } from 'src/app/services/inspection.service';
import { DialogPhotoViewerComponent } from '../../../../components/dialog-photo-viewer/dialog-photo-viewer.component';
import { forkJoin } from 'rxjs';
import * as L from 'leaflet';
import { UsersService } from 'src/app/services/users.service';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { EspecialidadesService } from '../../../../services/especialidades.service';
import { ChangeDetectorRef } from '@angular/core';

interface Repuesto {
  id: number;
  familia: string;
  articulo: string;
  marca: string;
  precio: number;
}

interface SubItem {
  id: number;
  name: string;
  disabled?: boolean;
  fotos?: string[];
  repuestos?: any[];
}

interface Item {
  id: number;
  name: string;
  estado?: string;
  subItems: SubItem[];
}

interface RepuestoItem {
  estado: string;
  comentario: string;
  fotos: string[];
  repuestos: any[];
}

interface RepuestoMap {
  [key: number]: {
    estado: string;
    comentario: string;
    fotos: string[];
    repuestos: Array<{
      cantidad: number;
      comentario: string;
      repuesto: Repuesto;
    }>;
  };
}

interface Tecnico {
  id: number;
  name: string;
  lastName?: string;
  especialidades: {
    id: number;
    nombre: string;
  }[];
}

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
    MatTableModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    DialogPhotoViewerComponent,
    ConfirmDialogComponent
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './modificar-solicitud.component.html',
  styleUrls: ['./modificar-solicitud.component.scss'],
  styles: [`
    .badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      margin-left: 8px;
    }

    .badge-success {
      background-color: rgba(76, 175, 80, 0.2);  /* Verde más suave */
      color: #2e7d32;  /* Verde oscuro para el texto */
      border: 1px solid #4caf50;
    }

    .badge-warning {
      background-color: rgba(255, 193, 7, 0.2);  /* Amarillo más suave */
      color: #f57c00;  /* Naranja oscuro para el texto */
      border: 1px solid #ffc107;
    }

    .badge-danger {
      background-color: rgba(244, 67, 54, 0.2);  /* Rojo más suave */
      color: #d32f2f;  /* Rojo oscuro para el texto */
      border: 1px solid #f44336;
    }

    .badge:hover {
      opacity: 0.9;
      transform: scale(1.05);
      transition: all 0.2s ease;
    }
  `]
})
export class ModificarSolicitudComponent implements OnInit {
  solicitudId: string;
  solicitudForm: FormGroup;
  solicitud: any;
  loading = false;
  tipoServicio: any;
  sectorTrabajo: any;
  listaInspeccion: any[] = [];
  especialidades: any[] = [];
  displayedColumns: string[] = [
    'id', 
    'repuesto.familia',
    'repuesto.articulo',
    'repuesto.marca',
    'repuesto.precio',
    'cantidad',
    'total',
    'comentario', 
    'fechaAgregado'
  ];
  itemRepuestos: any[] = [];
  repuestos: RepuestoMap = {};
  repuestosList: Repuesto[] = [];
  selectedRepuesto: Repuesto | null = null;
  newRepuestoCantidad: number = 1;
  showAddRepuestoForm: { [key: number]: boolean } = {};
  temporaryRepuestos: {[key: number]: any[]} = {};
  temporaryDeletedRepuestos: {[key: number]: any[]} = {};
  tiposServicio: any[] = [];
  sectoresTrabajos: any[] = [];
  tecnicos: Tecnico[] = [];
  private map: L.Map | null = null;
  isPendiente: boolean = false;
  isAprobada: boolean = false;
  isRechazada: boolean = false;
  isValidada: boolean = false;
  usuarioRechazo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private solicitarVisitaService: SolicitarVisitaService,
    private tipoServicioService: TipoServicioService,
    private sectoresService: SectoresService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private repuestosService: RepuestosService,
    private inspectionService: InspectionService,
    private sectorTrabajoService: SectoresService,
    private usersService: UsersService,
    private especialidadesService: EspecialidadesService,
    private cd: ChangeDetectorRef
  ) {
    this.solicitudForm = this.fb.group({
      tipoServicioId: [''],
      sectorTrabajoId: [''],
      especialidad: [''],
      fechaVisita: [{value: '', disabled: false}, Validators.required],
      ticketGruman: [''],
      observaciones: [''],
      status: [{value: '', disabled: true}],
      tecnico_asignado_id: ['', Validators.required],
      fecha_hora_inicio_servicio: [{value: '', disabled: true}],
      fecha_hora_fin_servicio: [{value: '', disabled: true}],
      longitud_movil: [''],
      latitud_movil: [''],
      // Campos adicionales de solo lectura
      'local.nombre_local': [{value: '', disabled: true}],
      'local.direccion': [{value: '', disabled: true}],
      'client.nombre': [{value: '', disabled: true}],
      'tecnico_asignado.name': [{value: '', disabled: true}],
      'tipoServicio': [{value: '', disabled: true}],
      'sectorTrabajo': [{value: '', disabled: true}]
    });
    this.temporaryRepuestos = {};
    this.temporaryDeletedRepuestos = {};
  }

  ngOnInit() {
    this.solicitudId = this.route.snapshot.paramMap.get('id') || '';
    
    // Detectar estado de la solicitud por URL
    const url = this.router.url;
    this.isPendiente = url.includes('pendiente');
    this.isAprobada = url.includes('aprobada');
    this.isRechazada = url.includes('rechazada');
    this.isValidada = url.includes('validada');
    
    this.inicializarFormulario();
    this.loadRepuestos();
    this.loadCatalogos();
    this.loadSolicitud();
    this.cargarTecnicos();
    this.loadEspecialidades();
    this.watchEspecialidadChanges();
  }

  inicializarFormulario() {
    this.solicitudForm = this.fb.group({
      tipoServicioId: [''],
      sectorTrabajoId: [''],
      especialidad: [''],
      fechaVisita: [{value: '', disabled: false}, Validators.required],
      ticketGruman: [''],
      observaciones: [''],
      status: [{value: '', disabled: true}],
      tecnico_asignado_id: ['', Validators.required],
      fecha_hora_inicio_servicio: [{value: '', disabled: true}],
      fecha_hora_fin_servicio: [{value: '', disabled: true}],
      longitud_movil: [''],
      latitud_movil: [''],
      // Campos adicionales de solo lectura
      'local.nombre_local': [{value: '', disabled: true}],
      'local.direccion': [{value: '', disabled: true}],
      'client.nombre': [{value: '', disabled: true}],
      'tecnico_asignado.name': [{value: '', disabled: true}],
      'tipoServicio': [{value: '', disabled: true}],
      'sectorTrabajo': [{value: '', disabled: true}]
    });
    this.temporaryRepuestos = {};
    this.temporaryDeletedRepuestos = {};
  }

  loadCatalogos(): Promise<void> {
    return new Promise((resolve) => {
      // Usamos forkJoin para cargar todos los catálogos simultáneamente
      forkJoin({
        tiposServicio: this.tipoServicioService.findAll(),
        sectoresTrabajos: this.sectorTrabajoService.getSectores(),
        repuestos: this.repuestosService.getRepuestos()
      }).subscribe({
        next: (result) => {
          this.tiposServicio = result.tiposServicio;
          this.sectoresTrabajos = result.sectoresTrabajos;
          this.repuestos = result.repuestos;
          this.repuestosList = Object.values(result.repuestos);
          
          console.log('Catálogos cargados:', { 
            tiposServicio: this.tiposServicio, 
            sectoresTrabajos: this.sectoresTrabajos,
            repuestos: this.repuestos
          });
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading catálogos:', error);
          this.snackBar.open('Error al cargar los catálogos', 'Cerrar', {
            duration: 3000
          });
          resolve(); // Resolvemos igual para continuar con la carga
        }
      });
    });
  }

  loadRepuestos() {
    this.repuestosService.getRepuestos().subscribe({
      next: (data) => {
        this.repuestos = data;
      },
      error: (error) => {
        console.error('Error al cargar repuestos:', error);
        this.snackBar.open('Error al cargar la lista de repuestos', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  loadSolicitud() {
    this.loading = true;
    this.solicitarVisitaService.getSolicitudVisita(Number(this.solicitudId)).subscribe({
      next: (data) => {
        this.solicitud = data;
        
        // Detectar estado de la solicitud por su estado actual
        if (this.solicitud?.status === 'pendiente') {
          this.isPendiente = true;
        } else if (this.solicitud?.status === 'aprobada') {
          this.isAprobada = true;
        } else if (this.solicitud?.status === 'rechazada') {
          this.isRechazada = true;
          
          // Cargar la información del usuario que rechazó la solicitud
          if (this.solicitud?.rechazada_por_id) {
            this.loading = true; // Mantener loading mientras cargamos datos adicionales
            this.usersService.getUserById(this.solicitud.rechazada_por_id).subscribe({
              next: (usuario) => {
                this.usuarioRechazo = usuario;
                console.log('Usuario que rechazó la solicitud:', usuario);
              },
              error: (error) => {
                console.error('Error al cargar información del usuario que rechazó:', error);
                this.snackBar.open('No se pudo cargar la información completa del usuario que rechazó la solicitud', 'Cerrar', {
                  duration: 5000
                });
              },
              complete: () => {
                this.loading = false;
              }
            });
          } else {
            console.warn('La solicitud está rechazada pero no tiene rechazada_por_id');
          }
        }
        
        // Si el estado es pendiente, habilitar los controles necesarios
        if (this.isPendiente) {
          this.solicitudForm.get('tecnico_asignado_id')?.enable();
          this.solicitudForm.get('tipoServicioId')?.enable();
          this.solicitudForm.get('sectorTrabajoId')?.enable();
        } else {
          // Si no está en pendiente, deshabilitar los controles
          this.solicitudForm.get('tecnico_asignado_id')?.disable();
          this.solicitudForm.get('tipoServicioId')?.disable();
          this.solicitudForm.get('sectorTrabajoId')?.disable();
        }
        
        this.itemRepuestos = data.itemRepuestos || [];

        // Encontrar los nombres de tipo servicio y sector trabajo
        const tipoServicio = this.tiposServicio.find(t => t.id === data.tipoServicioId);
        const sectorTrabajo = this.sectoresTrabajos.find(s => s.id === data.sectorTrabajoId);

        // Actualizar el formulario con los datos
        this.solicitudForm.patchValue({
          'client.nombre': data.client?.nombre || '',
          'local.nombre_local': data.local?.nombre_local || '',
          'local.direccion': data.local?.direccion || '',
          'tecnico_asignado.name': data.tecnico_asignado?.name || '',
          'tipoServicioId': data.tipoServicioId || (data.tipoServicio?.id || ''),
          'sectorTrabajoId': data.sectorTrabajoId || '',
          'especialidad': data.especialidad || '',
          'fechaVisita': data.fechaVisita ? new Date(data.fechaVisita) : null,
          'ticketGruman': data.ticketGruman || '',
          'status': data.status || '',
          'observaciones': data.observaciones || '',
          'fecha_hora_inicio_servicio': data.fecha_hora_inicio_servicio || '',
          'fecha_hora_fin_servicio': data.fecha_hora_fin_servicio || '',
          'longitud_movil': data.longitud_movil || '',
          'latitud_movil': data.latitud_movil || '',
          'tecnico_asignado_id': data.tecnico_asignado?.id || ''
        });

        // Si está rechazada, deshabilitar todos los controles
        if (this.isRechazada) {
          this.deshabilitarControlesFormulario();
        }
        
        // Procesar lista de inspección
        if (data.client?.listaInspeccion) {
          this.listaInspeccion = data.client.listaInspeccion.map((lista: any) => ({
            ...lista,
            items: lista.items.map((item: any) => ({
              ...item,
              subItems: item.subItems.map((subItem: any) => {
                // Filtrar los repuestos para este subItem
                const subItemRepuestos = this.itemRepuestos.filter(
                  repuesto => repuesto.itemId === subItem.id
                );

                // Obtener el último repuesto para determinar el estado
                const lastRepuesto = subItemRepuestos
                  .sort((a, b) => new Date(b.fechaAgregado).getTime() - new Date(a.fechaAgregado).getTime())[0];

                const fotos = subItemRepuestos.reduce((acc: string[], repuesto: any) => {
                  if (repuesto.fotos && Array.isArray(repuesto.fotos)) {
                    return [...acc, ...repuesto.fotos];
                  }
                  return acc;
                }, []);

                return {
                  ...subItem,
                  estado: lastRepuesto?.estado || 'no_conforme',
                  fotos: fotos,
                  repuestos: subItemRepuestos
                };
              })
            }))
          }));
        }

        // Agrupar las fotos por itemId
        const fotosPorItem: { [key: number]: string[] } = {};
        if (data.itemFotos) {
          data.itemFotos.forEach((itemFoto: any) => {
            fotosPorItem[itemFoto.itemId] = itemFoto.fotos;
          });
        }

        // Asignar las fotos a los repuestos según su itemId
        this.repuestos = {};
        this.itemRepuestos.forEach(repuesto => {
          if (!this.repuestos[repuesto.itemId]) {
            this.repuestos[repuesto.itemId] = {
              estado: repuesto.estado,
              comentario: repuesto.comentario,
              fotos: fotosPorItem[repuesto.itemId] || [],
              repuestos: []
            };
          }
          this.repuestos[repuesto.itemId].repuestos.push({
            cantidad: repuesto.cantidad,
            comentario: repuesto.comentario,
            repuesto: repuesto.repuesto
          });
        });

        // Inicializar mapa después de cargar los datos
        setTimeout(() => {
          this.initMap();
        }, 100);

        this.loading = false;
      },
      error: (error:any) => {
        console.error('Error loading solicitud:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar la solicitud', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/transacciones/solicitudes-de-visita']);
  }

  aprobarSolicitud(): void {
    // Verificar si el formulario es válido
    if (this.solicitudForm.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.solicitudForm.controls).forEach(key => {
        const control = this.solicitudForm.get(key);
        control?.markAsTouched();
      });
      
      this.snackBar.open('Por favor completa los campos requeridos antes de aprobar la solicitud', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validar que haya un técnico asignado
    if (!this.solicitudForm.get('tecnico_asignado_id')?.value) {
      this.snackBar.open('No se puede aprobar la solicitud sin un técnico asignado', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validar que haya una fecha de visita
    if (!this.solicitudForm.get('fechaVisita')?.value) {
      this.snackBar.open('No se puede aprobar la solicitud sin una fecha de visita', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Proceder con la aprobación
    this.loading = true;
    
    // Primero guardar los cambios en el formulario
    this.saveChanges().then(() => {
      // Obtener el ID del técnico asignado y la especialidad
      const tecnicoAsignadoId = this.solicitudForm.get('tecnico_asignado_id')?.value;
      const especialidad = this.solicitudForm.get('especialidad')?.value;
      const fechaVisita = this.solicitudForm.get('fechaVisita')?.value;
      
      // Luego aprobar la solicitud
      this.solicitarVisitaService.aprobarSolicitudVisita(
        Number(this.solicitudId), 
        tecnicoAsignadoId,
        especialidad,
        fechaVisita
      ).subscribe({
        next: () => {
          this.snackBar.open('Solicitud aprobada correctamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/transacciones/solicitudes-de-visita']);
        },
        error: (error: any) => {
          console.error('Error al aprobar la solicitud:', error);
          this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }).catch(error => {
      console.error('Error al guardar los cambios del formulario:', error);
      this.snackBar.open('Error al guardar los cambios del formulario', 'Cerrar', {
        duration: 3000
      });
      this.loading = false;
    });
  }

  rechazarSolicitud(): void {
    // Diálogo para pedir motivo de rechazo
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Rechazar Solicitud',
        message: '¿Estás seguro de que deseas rechazar esta solicitud?',
        inputLabel: 'Motivo del rechazo',
        inputPlaceholder: 'Ingrese el motivo del rechazo',
        requireInput: true, // Requiere que se ingrese un motivo
        confirmText: 'Rechazar',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        
        // Obtenemos la información del usuario actual
        const currentUser = this.authService.currentUserValue;
        console.log('Usuario actual:', currentUser);
        
        this.solicitarVisitaService.rechazarSolicitudVisita(Number(this.solicitudId), {
          motivo: result,
          rechazada_por_id: currentUser?.id
        }).subscribe({
          next: () => {
            this.snackBar.open('Solicitud rechazada correctamente', 'Cerrar', {
              duration: 3000
            });
            this.router.navigate(['/transacciones/solicitudes-de-visita']);
          },
          error: (error) => {
            console.error('Error al rechazar la solicitud:', error);
            this.snackBar.open('Error al rechazar la solicitud', 'Cerrar', {
              duration: 3000
            });
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  onSaveRepuestos(): void {
    // Si la solicitud está rechazada, no permitir guardar repuestos
    if (this.isRechazada) {
      return;
    }
    
    console.log('Iniciando guardado de repuestos...');
    this.loading = true;

    // Crear un array de promesas para todas las operaciones
    const promises: Promise<any>[] = [];

    // Manejar repuestos eliminados
    for (const subItemId in this.temporaryDeletedRepuestos) {
      for (const repuesto of this.temporaryDeletedRepuestos[subItemId]) {
        promises.push(
          this.inspectionService.deleteRepuestoFromItem(repuesto.id).toPromise()
        );
      }
    }

    // Manejar nuevos repuestos
    for (const subItemId in this.temporaryRepuestos) {
      // Encontrar el estado actual del subItem si existe
      let estadoSubItem: string | undefined;
      const subItemInfo = this.findSubItemById(Number(subItemId));
      if (subItemInfo) {
        estadoSubItem = subItemInfo.estado;
      }
      
      for (const repuesto of this.temporaryRepuestos[subItemId]) {
        if (!repuesto.pendingDelete) {
          promises.push(
            this.inspectionService.insertRepuestoInItem(
              String(subItemId),
              repuesto.repuesto.id,
              repuesto.cantidad,
              repuesto.comentario,
              Number(this.solicitudId),
              estadoSubItem // Pasar el estado actual si existe
            ).toPromise()
          );
        }
      }
    }

    // Ejecutar todas las operaciones
    Promise.all(promises)
      .then(() => {
        // Limpiar los temporales
        this.temporaryRepuestos = {};
        this.temporaryDeletedRepuestos = {};
        
        // Recargar los datos
        this.loadSolicitud();
        
        this.snackBar.open('Repuestos guardados correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      })
      .catch((error) => {
        console.error('Error al guardar los repuestos:', error);
        this.snackBar.open('Error al guardar los repuestos', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // Método auxiliar para encontrar un subItem por su ID
  private findSubItemById(subItemId: number): any {
    if (!this.listaInspeccion) return null;
    
    for (const lista of this.listaInspeccion) {
      for (const item of lista.items) {
        for (const subItem of item.subItems) {
          if (subItem.id === subItemId) {
            return subItem;
          }
        }
      }
    }
    
    return null;
  }

  onValidate(): void {
    // Si la solicitud está rechazada, no permitir validar
    if (this.isRechazada) {
      return;
    }
    
    console.log('Iniciando validación...');
    this.authService.currentUser.subscribe(currentUser => {
      if (!currentUser || !currentUser.id) {
        this.snackBar.open('Error: No se pudo obtener el usuario actual', 'Cerrar', {
          duration: 3000
        });
        return;
      }
      console.log('this.temporaryDeletedRepuestos', this.temporaryDeletedRepuestos);
      // Primero eliminamos los repuestos marcados para eliminar
      for (const subItemId in this.temporaryDeletedRepuestos) {
        for (const repuesto of this.temporaryDeletedRepuestos[subItemId]) {
          console.log('repuesto', repuesto.id);
          this.inspectionService.deleteRepuestoFromItem(repuesto.id).subscribe({
            next: () => {
              console.log('Repuesto eliminado correctamente');
            },
            error: (error) => {
              console.error('Error al eliminar repuesto:', error);
            }
          });
        }
      }

      // Primero actualizamos los datos del formulario
      const formValues = this.solicitudForm.getRawValue();
      const updateData = {
        especialidad: formValues.especialidad,
        ticketGruman: formValues.ticketGruman,
        observaciones: formValues.observaciones,
        longitud_movil: formValues.longitud_movil,
        latitud_movil: formValues.latitud_movil,
        listaInspeccion: this.listaInspeccion.map(lista => ({
          ...lista,
          items: lista.items.map((item: any) => ({
            ...item,
            subItems: item.subItems.map((subItem: any) => ({
              ...subItem
            }))
          }))
        }))
      };

      //agregar los items aca de temporalRepuestos
      console.log('temporalRepuestos', this.temporaryRepuestos);
      for (const subItemId in this.temporaryRepuestos) {
        for (const repuesto of this.temporaryRepuestos[subItemId]) {
          this.inspectionService.insertRepuestoInItem(String(subItemId), repuesto.repuesto.id, repuesto.cantidad, repuesto.comentario, Number(this.solicitudId)).subscribe({
            next: () => {
              console.log('Repuesto agregado correctamente');
            },
            error: (error) => {
              console.error('Error al agregar repuesto:', error);
            }
          });
        }
      }

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

  toggleAddRepuestoForm(subItemId: number) {
    this.showAddRepuestoForm[subItemId] = !this.showAddRepuestoForm[subItemId];
    if (this.showAddRepuestoForm[subItemId]) {
      // Reset form values
      this.selectedRepuesto = null;
      this.newRepuestoCantidad = 1;
    }
  }

  addRepuestoToItem(subItemId: number) {
    console.log('Iniciando addRepuestoToItem:', {
      subItemId,
      selectedRepuesto: this.selectedRepuesto,
      cantidad: this.newRepuestoCantidad
    });

    if (!this.selectedRepuesto || !this.newRepuestoCantidad) {
      console.log('Validación fallida: repuesto o cantidad no seleccionados');
      return;
    }

    // Obtener el estado actual del subítem
    const subItem = this.findSubItemById(subItemId);
    
    const nuevoRepuesto = {
      itemId: subItemId,
      repuestoId: this.selectedRepuesto.id,
      cantidad: this.newRepuestoCantidad,
      repuesto: this.selectedRepuesto,
      comentario: ''
    };
    console.log('Nuevo repuesto creado:', nuevoRepuesto);

    // Inicializar el array temporal si no existe
    if (!this.temporaryRepuestos[subItemId]) {
      this.temporaryRepuestos[subItemId] = [];
    }

    // Agregar al array temporal
    this.temporaryRepuestos[subItemId].push(nuevoRepuesto);
    console.log('Estado actual de repuestos temporales:', this.temporaryRepuestos);

    // Limpiar y actualizar
    this.selectedRepuesto = null;
    this.newRepuestoCantidad = 1;
    this.showAddRepuestoForm[subItemId] = false;
    this.updateListaInspeccion();

    console.log('Repuesto agregado exitosamente');
  }

  deleteRepuesto(subItemId: number, repuesto: any) {
    // Inicializar el array de repuestos eliminados si no existe
    if (!this.temporaryDeletedRepuestos[subItemId]) {
        this.temporaryDeletedRepuestos[subItemId] = [];
    }

    // Marcar el repuesto como pendiente de eliminar
    if (repuesto.id) {
        // Para repuestos existentes
        this.temporaryDeletedRepuestos[subItemId].push(repuesto);
        repuesto.pendingDelete = true;
    } else {
        // Para repuestos temporales
        if (this.temporaryRepuestos[subItemId]) {
            const repuestoTemp = this.temporaryRepuestos[subItemId].find(
                r => r.repuesto.id === repuesto.repuesto.id
            );
            if (repuestoTemp) {
                repuestoTemp.pendingDelete = true;
            }
        }
    }

    // Actualizar la vista
    this.updateListaInspeccion();
    
    this.snackBar.open(
        'Repuesto marcado para eliminar', 
        'Deshacer', 
        { 
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
        }
    ).onAction().subscribe(() => {  // Cambiado a onAction()
        // Deshacer la eliminación solo cuando se hace clic en "Deshacer"
        if (repuesto.id) {
            this.temporaryDeletedRepuestos[subItemId] = this.temporaryDeletedRepuestos[subItemId]
                .filter(r => r.id !== repuesto.id);
            repuesto.pendingDelete = false;
        } else {
            if (this.temporaryRepuestos[subItemId]) {
                const repuestoTemp = this.temporaryRepuestos[subItemId].find(
                    r => r.repuesto.id === repuesto.repuesto.id
                );
                if (repuestoTemp) {
                    repuestoTemp.pendingDelete = false;
                }
            }
        }
        this.updateListaInspeccion();
    });
  }

  // Método para verificar si un repuesto está pendiente de eliminar
  isRepuestoPendingDelete(subItemId: number, repuesto: any): boolean {
    return repuesto.id && repuesto.pendingDelete;
  }

  calculateSubItemTotal(repuestos: any[]): number {
    if (!repuestos || repuestos.length === 0) return 0;

    return repuestos
      .filter(rep => rep.repuesto) // Solo considerar repuestos válidos (no nulos)
      .reduce((total, repuesto) => {
        const precio = repuesto.repuesto?.precio || 0;
        const cantidad = repuesto.cantidad || 0;
        return total + (precio * cantidad);
      }, 0);
  }

  calculateItemTotal(repuestos: any[]): number {
    return this.calculateSubItemTotal(repuestos);
  }
  isValidated(): boolean {
    return this.solicitud?.status?.toLowerCase().trim() === 'validada';
  }
  calculateFinalTotal(): number {
    let finalTotal = 0;
    
    this.listaInspeccion.forEach(lista => {
      lista.items.forEach((item: any) => {
        item.subItems.forEach((subItem: any) => {
          if (subItem.repuestos) {
            // Usamos el mismo método que ya excluye los repuestos marcados para eliminar
            finalTotal += this.calculateSubItemTotal(subItem.repuestos);
          }
        });
      });
    });
    
    return finalTotal;
  }

  private updateListaInspeccion() {
    if (!this.listaInspeccion || !this.itemRepuestos) return;
  
    // Crear un mapa de fotos por itemId
    const fotosPorItem: { [key: number]: string[] } = {};
    if (this.solicitud?.itemFotos) {
      this.solicitud.itemFotos.forEach((itemFoto: any) => {
        fotosPorItem[itemFoto.itemId] = itemFoto.fotos || [];
      });
    }
  
    this.listaInspeccion = this.listaInspeccion.map(lista => ({
      ...lista,
      items: lista.items.map((item: any) => ({
        ...item,
        subItems: item.subItems.map((subItem: any) => {
          // Obtener repuestos existentes
          const existingRepuestos = this.itemRepuestos.filter(
            repuesto => repuesto.itemId === subItem.id
          );
  
          // Obtener repuestos temporales
          const tempRepuestos = this.temporaryRepuestos[subItem.id] || [];
  
          // Combinar repuestos existentes y temporales
          const allRepuestos = [
            ...existingRepuestos,
            ...tempRepuestos
          ].map(repuesto => ({
            ...repuesto,
            pendingDelete: this.temporaryDeletedRepuestos[subItem.id]?.some(
              deletedRepuesto => deletedRepuesto.id === repuesto.id
            ) || repuesto.pendingDelete
          }));
  
          // Verificar si hay fotos asociadas a este subItem
          const fotosDelItem = fotosPorItem[subItem.id] || [];
  
          return {
            ...subItem,
            estado: subItem.estado,
            fotos: fotosDelItem.length > 0 ? fotosDelItem : [],
            repuestos: allRepuestos
          };
        })
      }))
    }));
  
    console.log('Lista actualizada con fotos:', this.listaInspeccion);
  }
  
  
  openPhotoViewer(imageUrls: string[]): void {
    console.log('Opening photo viewer with URLs:', imageUrls); // Para debugging
    
    if (!imageUrls || imageUrls.length === 0) {
      this.snackBar.open('No hay imágenes disponibles', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    
    const dialogRef = this.dialog.open(DialogPhotoViewerComponent, {
      data: { imageUrls },
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  getEstadoLabel(estado: string | null): string {
    if (!estado) return '';
    
    switch (estado.toLowerCase()) {
      case 'conforme':
        return '✅ Conforme';
      case 'no_aplica':
        return '⚠️ No Aplica';
      case 'no_conforme':
        return '❌ No Conforme';
      default:
        return estado;
    }
  }

  getEstadoClass(estado: string | null): string {
    if (!estado) return '';
    
    switch (estado.toLowerCase()) {
      case 'conforme':
        return 'badge-success';
      case 'no_aplica':
        return 'badge-warning';
      case 'no_conforme':
        return 'badge-danger';
      default:
        return '';
    }
  }

  getItemFotos(itemId: number) {
    return this.solicitud?.itemFotos?.find((item: any) => item.itemId === itemId);
  }

  async saveChanges() {
    try {
      // Preparar los datos para guardar
      const changes = {
        addedRepuestos: Object.entries(this.temporaryRepuestos).flatMap(([itemId, repuestos]) => 
          repuestos.filter(r => !r.pendingDelete).map(r => ({
            itemId: parseInt(itemId),
            repuestoId: r.repuesto.id,
            cantidad: r.cantidad,
            solicitarVisitaId: Number(this.solicitudId),
            comentario: r.comentario || ''
          }))
        ),
        deletedRepuestos: Object.values(this.temporaryDeletedRepuestos).flat().map(r => r.id)
      };

      // Guardar los cambios
      await this.solicitarVisitaService.updateRepuestos(this.solicitudId, changes).toPromise();

      // Limpiar los temporales
      this.temporaryRepuestos = {};
      this.temporaryDeletedRepuestos = {};

      // Recargar la solicitud
      this.loadSolicitud();

      this.snackBar.open('Cambios guardados correctamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      this.snackBar.open('Error al guardar los cambios', 'Cerrar', { duration: 3000 });
    }
  }

  hasChanges(): boolean {
    return Object.values(this.temporaryRepuestos).some(repuestos => repuestos.length > 0) ||
           Object.values(this.temporaryDeletedRepuestos).some(repuestos => repuestos.length > 0);
  }

  private initMap(): void {
    if (!this.map) {
      // Configurar el ícono por defecto de Leaflet
      const iconRetinaUrl = 'assets/marker-icon-2x.png';
      const iconUrl = 'assets/marker-icon.png';
      const shadowUrl = 'assets/marker-shadow.png';
      
      const iconDefault = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = iconDefault;

      this.map = L.map('map', {
        center: [-33.4569, -70.6483],
        zoom: 13
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);

      // Usar latitud y longitud del móvil si están disponibles
      if (this.solicitud?.latitud_movil && this.solicitud?.longitud_movil) {
        const lat = parseFloat(this.solicitud.latitud_movil);
        const lng = parseFloat(this.solicitud.longitud_movil);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng])
            .bindPopup(`
              <b>${this.solicitud.local?.nombre_local || 'Local'}</b><br>
              ${this.solicitud.local?.direccion || ''}<br>
              ${this.solicitud.local?.comuna || ''}<br>
              <strong>Ubicación del técnico</strong><br>
              <img src="assets/images/empresas/wazee.png" 
                   onclick="window.open('https://waze.com/ul?ll=${lat},${lng}&navigate=yes', '_blank')"
                   style="cursor:pointer; width: 24px; height: 24px;">
              Abrir en Waze
            `);
          
          marker.addTo(this.map);
          this.map.setView([lat, lng], 15);
        }
      }
      // Si no hay coordenadas del móvil, usar las del local
      else if (this.solicitud?.local?.latitud && this.solicitud?.local?.longitud) {
        const lat = parseFloat(this.solicitud.local.latitud);
        const lng = parseFloat(this.solicitud.local.longitud);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng])
            .bindPopup(`
              <b>${this.solicitud.local?.nombre_local || 'Local'}</b><br>
              ${this.solicitud.local?.direccion || ''}<br>
              ${this.solicitud.local?.comuna || ''}<br>
              <img src="assets/images/empresas/wazee.png" 
                   onclick="window.open('https://waze.com/ul?ll=${lat},${lng}&navigate=yes', '_blank')"
                   style="cursor:pointer; width: 24px; height: 24px;">
              Abrir en Waze
            `);
          
          marker.addTo(this.map);
          this.map.setView([lat, lng], 15);
        }
      }
    }
  }

  // Método para guardar los cambios
  onSubmit() {
    // Si la solicitud está rechazada, no permitir enviar el formulario
    if (this.isRechazada) {
      return;
    }
    
    if (this.solicitudForm.valid) {
      const formData = this.solicitudForm.getRawValue(); // Obtiene valores incluso de campos deshabilitados
      
      // Si es pendiente, incluir el técnico asignado en la actualización
      if (this.isPendiente) {
        formData.tecnico_asignado_id = formData.tecnico_asignado_id || null;
      }

      this.solicitarVisitaService.updateSolicitudVisita(Number(this.solicitudId), formData).subscribe({
        next: (response: any) => {
          this.snackBar.open('Solicitud actualizada correctamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/transacciones/solicitudes-de-visita']);
        },
        error: (error: any) => {
          console.error('Error updating solicitud:', error);
          this.snackBar.open('Error al actualizar la solicitud', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }

  cargarTecnicos() {
    this.usersService.getAllTecnicos().subscribe({
      next: (response: Tecnico[]) => {
        this.tecnicos = response;
        console.log('Técnicos cargados:', this.tecnicos);
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
      }
    });
  }

  /**
   * Deshabilita todos los controles del formulario cuando la solicitud está rechazada
   */
  private deshabilitarControlesFormulario(): void {
    // Lista de controles que deben ser deshabilitados
    const controles = [
      'tipoServicioId',
      'sectorTrabajoId',
      'especialidad',
      'fechaVisita',
      'ticketGruman',
      'observaciones',
      'tecnico_asignado_id',
      'fecha_hora_inicio_servicio',
      'fecha_hora_fin_servicio',
      'latitud_movil',
      'longitud_movil'
    ];
    
    // Deshabilitar cada control
    controles.forEach(control => {
      const formControl = this.solicitudForm.get(control);
      if (formControl) {
        formControl.disable();
      }
    });
  }

  // Método para calcular el total general
  calculateTotal(): number {
    if (!this.listaInspeccion) return 0;
    
    return this.listaInspeccion.reduce((totalItems, item) => {
      if (!item.items) return totalItems;
      
      const subItemsTotal = item.items.reduce((totalSubItems: number, subItem: any  ) => {
        if (!subItem.repuestos) return totalSubItems;
        
        // Filtramos repuestos válidos (no nulos) y no marcados para eliminar
        const validRepuestos = subItem.repuestos.filter((rep: any) => 
          rep.repuesto && !this.isRepuestoPendingDelete(subItem.id, rep)
        );
        
        const subItemTotal = validRepuestos.reduce((total: number, repuesto: any) => {
          const precio = repuesto.repuesto?.precio || 0;
          const cantidad = repuesto.cantidad || 0;
          return total + (precio * cantidad);
        }, 0);
        
        return totalSubItems + subItemTotal;
      }, 0);
      
      return totalItems + subItemsTotal;
    }, 0);
  }

  private loadEspecialidades(): void {
    this.especialidadesService.findAll().subscribe({
      next: (data: any[]) => {
        this.especialidades = data;
        // Actualizar el valor en el formulario después de cargar las especialidades
        if (this.solicitud?.especialidad) {
          const especialidadId = Number(this.solicitud.especialidad);
          this.solicitudForm.patchValue({
            especialidad: especialidadId
          });
        }
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
      }
    });
  }

  getEspecialidadNombre(especialidadId: string | null): string {
    if (!especialidadId) return 'Sin especialidad';
    
    const especialidad = this.especialidades.find(e => e.id === Number(especialidadId));
    return especialidad ? especialidad.nombre : 'Sin especialidad';
  }

  getTipoServicioNombre(tipoServicioId: number | null): string {
    if (!tipoServicioId) return 'Sin tipo de servicio';
    const tipo = this.tiposServicio.find(t => t.id === tipoServicioId);
    return tipo ? tipo.nombre : 'Sin tipo de servicio';
  }

  getSectorTrabajoNombre(sectorTrabajoId: number | null): string {
    if (!sectorTrabajoId) return 'Sin sector de trabajo';
    const sector = this.sectoresTrabajos.find(s => s.id === sectorTrabajoId);
    return sector ? sector.nombre : 'Sin sector de trabajo';
  }

  // Método para verificar si el técnico tiene la especialidad requerida
  tecnicoTieneEspecialidad(tecnico: any): boolean {
    if (!this.solicitud?.especialidad) return false;
    const especialidadId = Number(this.solicitud.especialidad);
    return tecnico.especialidades?.some((esp: any) => esp.id === especialidadId);
  }

  // Opcional: Agregar un método para obtener el nombre de las especialidades del técnico
  getTecnicoEspecialidades(tecnico: Tecnico): string {
    return tecnico.especialidades
      ?.map(esp => esp.nombre)
      .join(', ') || 'Sin especialidades';
  }

  private watchEspecialidadChanges() {
    this.solicitudForm.get('especialidad')?.valueChanges.subscribe(newValue => {
      // Actualizar la especialidad en la solicitud para que tecnicoTieneEspecialidad funcione correctamente
      if (this.solicitud) {
        this.solicitud.especialidad = newValue?.toString();
      }
      // Forzar la actualización de la vista
      this.cd.detectChanges();
    });
  }
} 
