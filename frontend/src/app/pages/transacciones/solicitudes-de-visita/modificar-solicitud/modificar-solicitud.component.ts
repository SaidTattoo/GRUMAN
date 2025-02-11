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
    DialogPhotoViewerComponent
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
  selectedRepuesto: number | null = null;
  newRepuestoCantidad: number = 1;
  showAddRepuestoForm: { [key: number]: boolean } = {};
  temporaryRepuestos: {[key: number]: any[]} = {};
  temporaryDeletedRepuestos: {[key: number]: any[]} = {};
  tiposServicio: any[] = [];
  sectoresTrabajos: any[] = [];

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
    private sectorTrabajoService: SectoresService
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
      'tecnico_asignado.name': [{value: '', disabled: true}],
      'tipoServicio': [{value: '', disabled: true}],
      'sectorTrabajo': [{value: '', disabled: true}]
    });
    this.temporaryRepuestos = {};
    this.temporaryDeletedRepuestos = {};
  }

  ngOnInit() {
    this.solicitudId = this.route.snapshot.params['id'];
    // Primero cargamos los catálogos y luego la solicitud
    this.loadCatalogos().then(() => {
      this.loadSolicitud();
    });
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
          'tipoServicio': tipoServicio?.nombre || `Tipo Servicio ID: ${data.tipoServicioId}`,
          'sectorTrabajo': sectorTrabajo?.nombre || `Sector Trabajo ID: ${data.sectorTrabajoId}`,
          'especialidad': data.especialidad || '',
          'fechaIngreso': data.fechaIngreso ? new Date(data.fechaIngreso) : null,
          'ticketGruman': data.ticketGruman || '',
          'status': data.status || '',
          'observaciones': data.observaciones || '',
          'fecha_hora_inicio_servicio': data.fecha_hora_inicio_servicio || '',
          'fecha_hora_fin_servicio': data.fecha_hora_fin_servicio || '',
          'longitud_movil': data.longitud_movil || '',
          'latitud_movil': data.latitud_movil || ''
        });

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

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading solicitud:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar la solicitud', 'Cerrar', {
          duration: 3000
        });
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

  addRepuestoToSubItem(subItemId: number) {
    if (!this.selectedRepuesto || this.newRepuestoCantidad <= 0) {
      this.snackBar.open('Por favor seleccione un repuesto y una cantidad válida', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const repuesto = this.repuestos[this.selectedRepuesto];
    if (!repuesto) {
      this.snackBar.open('Repuesto no encontrado', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Inicializar el array temporal si no existe
    if (!this.temporaryRepuestos[subItemId]) {
      this.temporaryRepuestos[subItemId] = [];
    }

    const newItemRepuesto = {
      itemId: subItemId,
      solicitarVisitaId: Number(this.solicitudId),
      repuesto: repuesto,
      cantidad: this.newRepuestoCantidad,
      comentario: '',
      fechaAgregado: new Date()
    };

    // Agregar al array temporal
    this.temporaryRepuestos[subItemId].push(newItemRepuesto);
    console.log('Repuesto temporal agregado:', this.temporaryRepuestos);

    // Limpiar el formulario
    this.selectedRepuesto = null;
    this.newRepuestoCantidad = 1;
    this.showAddRepuestoForm[subItemId] = false;

    // Actualizar la vista
    this.updateListaInspeccion();
  }

  addRepuestoToItem(subItemId: number) {
    if (!this.selectedRepuesto || this.newRepuestoCantidad <= 0) {
        this.snackBar.open('Por favor seleccione un repuesto y una cantidad válida', 'Cerrar', {
            duration: 3000
        });
        return;
    }

    const repuesto = this.repuestos[this.selectedRepuesto];
    if (!repuesto) {
        this.snackBar.open('Repuesto no encontrado', 'Cerrar', {
            duration: 3000
        });
        return;
    }

    // Inicializar el array temporal si no existe
    if (!this.temporaryRepuestos[subItemId]) {
        this.temporaryRepuestos[subItemId] = [];
    }

    // Obtener el estado y fotos del último repuesto existente
    const existingRepuestos = this.itemRepuestos.filter(r => r.itemId === subItemId);
    const lastRepuesto = existingRepuestos.length > 0 ? 
        existingRepuestos[existingRepuestos.length - 1] : null;

    const newItemRepuesto = {
        itemId: subItemId,
        solicitarVisitaId: Number(this.solicitudId),
        repuesto: repuesto,
        cantidad: this.newRepuestoCantidad,
        comentario: '',
        fechaAgregado: new Date(),
        estado: lastRepuesto?.estado || 'Pendiente',
        fotos: lastRepuesto?.fotos || []
    };

    // Agregar al array temporal
    this.temporaryRepuestos[subItemId].push(newItemRepuesto);
    console.log('Repuesto temporal agregado:', this.temporaryRepuestos);

    // Limpiar el formulario
    this.selectedRepuesto = null;
    this.newRepuestoCantidad = 1;
    this.showAddRepuestoForm[subItemId] = false;

    // Actualizar la vista
    this.updateListaInspeccion();

    this.snackBar.open('Repuesto agregado temporalmente', 'Cerrar', {
        duration: 3000
    });
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
    
    return repuestos.reduce((total, repuesto) => {
      // Si el repuesto está marcado para eliminar, no lo incluimos en el total
      if (repuesto.pendingDelete) return total;
      
      const precio = repuesto.repuesto?.precio || 0;
      const cantidad = repuesto.cantidad || 0;
      return total + (precio * cantidad);
    }, 0);
  }

  calculateItemTotal(repuestos: any[]): number {
    return this.calculateSubItemTotal(repuestos);
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
            fotosPorItem[itemFoto.itemId] = itemFoto.fotos;
        });
    }

    this.listaInspeccion = this.listaInspeccion.map(lista => ({
        ...lista,
        items: lista.items.map((item: any)   => ({
            ...item,
            subItems: item.subItems.map((subItem: any) => {
                // Obtener repuestos existentes
                const existingRepuestos = this.itemRepuestos.filter(
                    repuesto => repuesto.itemId === subItem.id
                );

                // Obtener repuestos temporales para este subItem
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

                // Obtener las fotos del itemId correspondiente
                const fotosDelItem = fotosPorItem[subItem.id] || [];

                return {
                    ...subItem,
                    estado: subItem.estado || 'no_conforme',
                    fotos: fotosDelItem,
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
} 
