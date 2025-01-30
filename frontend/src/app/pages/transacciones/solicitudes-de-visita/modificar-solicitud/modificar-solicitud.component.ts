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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RepuestosService } from 'src/app/services/repuestos.service';
import { InspectionService } from 'src/app/services/inspection.service';

interface Repuesto {
  id: number;
  familia: string;
  articulo: string;
  marca: string;
  precio: number;
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
    MatCardContent,
    MatTableModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule
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
  repuestos: Repuesto[] = [];
  selectedRepuesto: number | null = null;
  newRepuestoCantidad: number = 1;
  showAddRepuestoForm: { [key: number]: boolean } = {};
  temporaryRepuestos: {[key: number]: any[]} = {};
  temporaryDeletedRepuestos: {[key: number]: any[]} = {};

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
    private inspectionService: InspectionService
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
    this.loadRepuestos();
    this.loadSolicitud();
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
    console.log('Loading solicitud...');
    this.solicitarVisitaService.getSolicitudVisita(Number(this.solicitudId)).subscribe({
      next: (data) => {
        console.log('Solicitud data received:', data);
        this.solicitud = data;
        this.itemRepuestos = data.itemRepuestos || [];
        
        // Procesar lista de inspección y asignar repuestos a cada subitem
        if (data.client?.listaInspeccion) {
          this.listaInspeccion = data.client.listaInspeccion.map((lista: any) => ({
            ...lista,
            items: lista.items.map((item: any) => ({
              ...item,
              subItems: item.subItems.map((subItem: any) => ({
                ...subItem,
                repuestos: this.itemRepuestos.filter((repuesto: any) => repuesto.itemId === subItem.id)
              }))
            }))
          }));
        }
        console.log('Lista de inspección:', this.listaInspeccion);
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
       // repuestos: this.temporaryRepuestos // Incluir los repuestos temporales
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

    const repuesto = this.repuestos.find(r => r.id === this.selectedRepuesto);
    if (!repuesto) {
      this.snackBar.open('Repuesto no encontrado', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const newItemRepuesto = {
      itemId: subItemId,
      solicitarVisitaId: Number(this.solicitudId),
      repuesto: repuesto,
      cantidad: this.newRepuestoCantidad,
      comentario: '',
      fechaAgregado: new Date()
    };

    // Agregar al almacenamiento temporal
    if (!this.temporaryRepuestos[subItemId]) {
      this.temporaryRepuestos[subItemId] = [];
    }
    this.temporaryRepuestos[subItemId].push(newItemRepuesto);

    // Actualizar la vista
    this.updateListaInspeccion();

    // Ocultar el formulario
    this.showAddRepuestoForm[subItemId] = false;

    // Reset form values
    this.selectedRepuesto = null;
    this.newRepuestoCantidad = 1;

    this.snackBar.open('Repuesto agregado temporalmente', 'Cerrar', {
      duration: 3000
    });
  }

  addRepuestoToItem(itemId: number) {
    // Reuse the same logic as addRepuestoToSubItem
    if (!this.selectedRepuesto || this.newRepuestoCantidad <= 0) {
      this.snackBar.open('Por favor seleccione un repuesto y una cantidad válida', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const repuesto = this.repuestos.find(r => r.id === this.selectedRepuesto);
    if (!repuesto) {
      this.snackBar.open('Repuesto no encontrado', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const newItemRepuesto = {
      itemId: itemId,
      solicitarVisitaId: Number(this.solicitudId),
      repuesto: repuesto,
      cantidad: this.newRepuestoCantidad,
      comentario: '',
      fechaAgregado: new Date()
    };

    this.itemRepuestos.push(newItemRepuesto);
    this.updateListaInspeccion();
    this.showAddRepuestoForm[itemId] = false;
    this.selectedRepuesto = null;
    this.newRepuestoCantidad = 1;

    this.snackBar.open('Repuesto agregado correctamente', 'Cerrar', {
      duration: 3000
    });
  }

  deleteRepuesto(subItemId: number, repuesto: any, index: number) {
    if (!repuesto.id) { // Si es un repuesto temporal
      // Eliminar del array temporal
      this.temporaryRepuestos[subItemId] = this.temporaryRepuestos[subItemId].filter(
        (r, i) => i !== index
      );
      
      // Si el array queda vacío, eliminar la propiedad
      if (this.temporaryRepuestos[subItemId].length === 0) {
        delete this.temporaryRepuestos[subItemId];
      }
    } else { // Si es un repuesto existente
      // Agregar a temporaryDeletedRepuestos
      if (!this.temporaryDeletedRepuestos[subItemId]) {
        this.temporaryDeletedRepuestos[subItemId] = [];
      }
      this.temporaryDeletedRepuestos[subItemId].push(repuesto);

      // Marcar como pendiente de eliminar en la vista
      repuesto.pendingDelete = true;
      console.log(' this.temporaryDeletedRepuestos',  this.temporaryDeletedRepuestos);
    }

    // Actualizar la vista
    this.updateListaInspeccion();
    
    this.snackBar.open(
      repuesto.id ? 'Repuesto marcado para eliminar' : 'Repuesto temporal eliminado', 
      'Cerrar', 
      { duration: 3000 }
    );
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
    this.listaInspeccion = this.listaInspeccion.map(lista => ({
      ...lista,
      items: lista.items.map((item: any) => ({
        ...item,
        subItems: item.subItems.map((subItem: any) => {
          // Obtener los repuestos existentes del itemRepuestos
          const existingRepuestos = this.itemRepuestos.filter((repuesto: any) => repuesto.itemId === subItem.id);
          // Obtener los repuestos temporales
          const tempRepuestos = this.temporaryRepuestos[subItem.id] || [];
          // Combinar ambos arrays, poniendo los temporales primero
          return {
            ...subItem,
            repuestos: [...tempRepuestos, ...existingRepuestos]
          };
        })
      }))
    }));
  }
} 