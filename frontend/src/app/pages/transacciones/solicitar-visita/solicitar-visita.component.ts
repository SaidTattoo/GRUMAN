import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { UserService } from 'src/app/core/services/user.service';
import { LocalesService } from 'src/app/services/locales.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { SectoresService } from 'src/app/services/sectores.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UploadDataService } from 'src/app/services/upload-data.service';
import Swal from 'sweetalert2';
import { ClientesService } from 'src/app/services/clientes.service';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import { environment } from 'src/app/config';
import { Observable, Subject, of } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { S } from '@angular/cdk/keycodes';
import { ActivoFijoLocalService } from 'src/app/services/activo-fijo-local.service';


interface Client {
  id: number;
  nombre: string;
  // ... otros campos necesariosa
}

interface Especialidad {
  id: number;
  nombre: string;
}



@Component({
  selector: 'app-solicitar-visita',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './solicitar-visita.component.html',
  styleUrls: ['./solicitar-visita.component.scss'],
  providers: [provideNativeDateAdapter()],
})
export class SolicitarVisitaComponent implements OnInit, OnDestroy{
  selectedFiles: File[] = [];
  previewUrls: { [key: number]: SafeUrl } = {};
  locales: any[] = [];
  sectores: any[] = [];
  tipoServicio: any[] = [];
  especialidades: Especialidad[] = [];
  user: any;
  visitaForm: FormGroup;
  urlImage: string[] = []; // Cambiado a arreglo para almacenar las URLs
  clientId: number;
  private storageSubscription: Subscription;
  client: Client | null = null;
  private currentUserId: number;
  filteredLocales: Observable<any[]>;
  private destroy$ = new Subject<void>();
  filteredEspecialidades: Observable<Especialidad[]>;
  filteredTipoServicio: Observable<any[]>;
  isReactivo: boolean = false;
  showClimaInput: boolean = false;
  activosFijos: any[] = [];
  filteredActivosFijos: Observable<any[]>;

  constructor(
   private userService: UserService,
    private localesService: LocalesService,
    private tipoServicioService: TipoServicioService,
    private sectoresService: SectoresService,
    private solicitarVisitaService: SolicitarVisitaService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private uploadDataService: UploadDataService,
    private clientesService: ClientesService,
    private storage: StorageService,
    private especialidadesService: EspecialidadesService,
    private activoFijoLocalService: ActivoFijoLocalService
  ) {
    this.visitaForm = this.fb.group({
      tipoServicioId: [null, Validators.required],
      localId: [null, Validators.required],
      clientId: [null, Validators.required],
      sectorTrabajoId: [null, Validators.required],
      especialidad: [null, [Validators.required]],
      activoFijoId: [''],
      observaciones: [''],
      fechaIngreso: [new Date()],
    });

    // Obtener el cliente seleccionado del localStorage o de un servicio
    const selectedClient = localStorage.getItem('selectedClient');
    this.client = selectedClient ? JSON.parse(selectedClient) : null;

    // Obtener el ID del usuario actual del storage
    const userData = this.storage.getCurrentUser();
    this.currentUserId = userData?.id;

    // Suscribirse a cambios en el usuario
    this.storage.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });
  }

  ngOnInit(): void {
    
    this.storageSubscription = this.storage.user$.subscribe(user => {
      if (user && user.selectedCompany) {
        this.clientId = user.selectedCompany.id;
        console.log('clientId', user.selectedCompany.clima)
        this.currentUserId = user.id;
        
        // Agregar esta línea para guardar el estado de clima
        this.showClimaInput = user.selectedCompany.clima || false;
        
        // Obtener los datos del cliente
        this.clientesService.getCliente(this.clientId).subscribe(
          (clientData) => {
            this.client = clientData;
          }
        );
        this.getLocales();
        this.getTipoServicio();
        this.getSectoresTrabajo();
        this.loadEspecialidades();
        this.visitaForm.patchValue({
          clientId: this.clientId
        });
      }
    });
    this.setupLocalAutocomplete();
    this.setupEspecialidadAutocomplete();
    this.setupTipoServicioAutocomplete();

    // Modificar el observer del tipo de servicio
    this.visitaForm.get('tipoServicioId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipoServicio => {
        if (tipoServicio) {
          this.isReactivo = tipoServicio.nombre?.toLowerCase() === 'reactivo';
          
          // Si no es reactivo o no hay clima, resetear el campo de activo fijo
          if (!this.isReactivo || !this.showClimaInput) {
            this.visitaForm.patchValue({ activoFijoId: '' });
          }
        }
      });

    // Modificar el observer de localId
    this.visitaForm.get('localId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(local => {
        // Limpiar el campo de activo fijo
        this.visitaForm.patchValue({ activoFijoId: null }, { emitEvent: false });
        
        // Cargar los nuevos activos fijos si hay un local seleccionado
        if (local?.id) {
          this.activoFijoLocalService.getActivosFijosByLocal(local.id).subscribe(
            (activosFijos) => {
              this.activosFijos = activosFijos;
              this.filteredActivosFijos = of(this.activosFijos);
            },
            (error) => {
              console.error('Error al cargar activos fijos:', error);
              this.activosFijos = [];
              this.filteredActivosFijos = of([]);
            }
          );
        } else {
          // Si no hay local seleccionado, limpiar los arrays
          this.activosFijos = [];
          this.filteredActivosFijos = of([]);
        }
      });

    this.setupActivoFijoAutocomplete();
  }

  ngOnDestroy(): void {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  async subirImagenes(visitaId: number): Promise<string[]> {
    try {
      const path = `solicitar_visita/${visitaId}/imagenes`;

      const uploadPromises = this.selectedFiles.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalname', file.name);

        return this.uploadDataService.uploadFile(formData, path).toPromise();
      });

      const responses = await Promise.all(uploadPromises);
      this.urlImage = responses.map((res: any) => {
        if (res && res.url) {
          return res.url.replace(/http:\/\/localhost:3000|https?:\/\/[^\/]+/, environment.apiUrl);
        }
        return res.url;
      });

      return this.urlImage;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      throw error;
    }
  }

  async onSubmit() {
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres crear la programación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (confirmResult.isConfirmed) {
      try {
        const fechaActual = new Date();
        
        const formData = {
          ...this.visitaForm.value,
          clientId: this.clientId,
          generada_por_id: this.currentUserId,
          tipoServicioId: this.visitaForm.value.tipoServicioId?.id || null,
          localId: this.visitaForm.value.localId?.id || null,
          especialidad: this.visitaForm.value.especialidad?.id || null,
          activoFijoId: this.visitaForm.value.activoFijoId?.id || null,
          fecha: fechaActual.toISOString(),
          fechaIngreso: this.visitaForm.value.fechaIngreso ? 
            new Date(this.visitaForm.value.fechaIngreso).toISOString() : 
            fechaActual.toISOString(),
          imagenes: []
        };

        const response:any = await this.solicitarVisitaService.crearSolicitudVisita(formData).toPromise();
        
        if (response?.success && response?.data) {
          // Si hay archivos para subir, procesarlos
          if (this.selectedFiles.length > 0) {
            await this.subirImagenes(response.data.id);
          }
          
          // Mostrar el modal de éxito con la información detallada
          await Swal.fire({
            title: 'Éxito',
            html: `
              <div>
                <div class="mb-3">Solicitud de visita generada correctamente</div>
                <div class="mb-2">
                  <strong>N° Requerimiento:</strong> ${response.data.id}
                </div>
                <div class="mb-2">
                  <strong>Fecha:</strong> ${this.formatDate(new Date().toISOString())}
                </div>
                <div class="mb-2">
                  <strong>Local:</strong> ${response.data.local.nombre_local}
                </div>
                <div class="mb-2">
                  <strong>Dirección:</strong> ${response.data.local.direccion}
                </div>
                <div class="mb-2">
                  <strong>Tipo de Servicio:</strong> ${this.visitaForm.value.tipoServicioId?.nombre || ''}
                </div>
                <div class="mb-2">
                  <strong>Sector:</strong> ${this.sectores.find(s => s.id === this.visitaForm.value.sectorTrabajoId)?.nombre || ''}
                </div>
                <div class="mb-2">
                  <strong>Especialidad:</strong> ${this.visitaForm.value.especialidad?.nombre || ''}
                </div>
                ${this.visitaForm.value.observaciones ? `
                  <div class="mb-2">
                    <strong>Observaciones:</strong> ${this.visitaForm.value.observaciones}
                  </div>
                ` : ''}
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            width: '600px'
          });

          // Limpiar el formulario
          this.visitaForm.reset();
          this.selectedFiles = [];
          this.previewUrls = {};
        }
      } catch (error: any) {
        console.error('Error al crear la visita:', error);
        const errorMessage = error.error?.message || 'No se pudo crear la solicitud de visita';
        Swal.fire('Error', errorMessage, 'error');
      }
    }
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }


  getLocales() {
    this.localesService.getLocalesByCliente(this.clientId)
      .pipe(
        map(locales => {
          return locales.sort((a: any, b: any) => {
            // Función para extraer números del inicio del string
            const getLeadingNumber = (str: string) => {
              const match = str.match(/^\d+/);
              return match ? parseInt(match[0]) : null;
            };

            const aName = a.nombre_local.toLowerCase();
            const bName = b.nombre_local.toLowerCase();
            
            // Obtener números del inicio si existen
            const aNum = getLeadingNumber(aName);
            const bNum = getLeadingNumber(bName);

            // Si ambos nombres empiezan con números
            if (aNum !== null && bNum !== null) {
              return aNum - bNum;
            }
            
            // Si solo uno empieza con número, el que no tiene número va primero
            if (aNum === null && bNum !== null) return -1;
            if (aNum !== null && bNum === null) return 1;
            
            // Si ninguno empieza con número, ordenar alfabéticamente
            return aName.localeCompare(bName, 'es');
          });
        })
      )
      .subscribe((response) => {
        this.locales = response;
      });
  }

  getSectoresTrabajo() {
    this.sectoresService.getSectores()
      .pipe(
        map(sectores => 
          sectores.sort((a:any, b:any) => 
            a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
          )
        )
      )
      .subscribe((response) => {
        this.sectores = response;
      });
  }

  getTipoServicio() {
    this.clientesService.getCliente(this.clientId)
      .pipe(
        map(response => ({
          ...response,
          tipoServicio: response.tipoServicio.sort((a:any, b:any) => 
            a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
          )
        }))
      )
      .subscribe((response) => {
        this.tipoServicio = response.tipoServicio;
      });
  }

  loadEspecialidades() {
    this.especialidadesService.findAll()
      .pipe(
        map((especialidades: Especialidad[]) => 
          especialidades.sort((a, b) => 
            a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
          )
        )
      )
      .subscribe({
        next: (data: Especialidad[]) => {
          this.especialidades = data;
        },
        error: (error) => {
          console.error('Error cargando especialidades:', error);
        }
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('originalname', file.name);

        this.uploadDataService.uploadFile(formData, 'solicitar_visita').subscribe({
          next: (response: any) => {
            if (response && response.url) {
              this.urlImage.push(response.url);
              console.log(`Imagen subida exitosamente: ${response.url}`);
              
              this.selectedFiles.push(file);
              this.createImagePreview(file, this.selectedFiles.length - 1);
            }
          },
          error: (error) => {
            console.error('Error al subir la imagen:', error);
            Swal.fire('Error', 'Hubo un problema al subir la imagen', 'error');
          },
        });
      });
    }
  }

  createImagePreview(file: File, index: number) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrls[index] = this.sanitizer.bypassSecurityTrustUrl(
        e.target.result
      );
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    delete this.previewUrls[index];
  }

  private setupLocalAutocomplete() {
    // Initialize filteredLocales
    this.filteredLocales = this.visitaForm.get('localId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLocales(value))
    );
  }

  private _filterLocales(value: any): any[] {
    if (!this.locales) return [];
    
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.locales.filter(local => 
      local.nombre_local.toLowerCase().includes(filterValue)
    );
  }

  onLocalFocus() {
    this.filteredLocales = new Observable(observer => {
      observer.next(this.locales);
    });
  }

  displayLocalFn(local: any): string {
    return local ? local.nombre_local : '';
  }

  filtrarLocales(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredLocales = new Observable(observer => {
      observer.next(
        this.locales.filter(local =>
          local.nombre_local.toLowerCase().includes(filterValue)
        )
      );
    });
  }

  private setupEspecialidadAutocomplete() {
    this.filteredEspecialidades = this.visitaForm.get('especialidad')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterEspecialidades(value))
    );
  }

  private _filterEspecialidades(value: any): Especialidad[] {
    if (!this.especialidades) return [];
    
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.especialidades.filter(esp => 
      esp.nombre.toLowerCase().includes(filterValue)
    );
  }

  onEspecialidadFocus() {
    this.filteredEspecialidades = new Observable(observer => {
      observer.next(this.especialidades);
    });
  }

  displayEspecialidadFn(especialidad: any): string {
    return especialidad ? especialidad.nombre : '';
  }

  filtrarEspecialidades(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEspecialidades = new Observable(observer => {
      observer.next(
        this.especialidades.filter(esp =>
          esp.nombre.toLowerCase().includes(filterValue)
        )
      );
    });
  }

  private setupTipoServicioAutocomplete() {
    this.filteredTipoServicio = this.visitaForm.get('tipoServicioId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTipoServicio(value))
    );
  }

  private _filterTipoServicio(value: any): any[] {
    if (!this.tipoServicio) return [];
    
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.tipoServicio.filter(tipo => 
      tipo.nombre.toLowerCase().includes(filterValue)
    );
  }

  onTipoServicioFocus() {
    this.filteredTipoServicio = of(this.tipoServicio);
  }

  displayTipoServicioFn = (tipo: any): string => {
    return tipo ? tipo.nombre : '';
  }

  filtrarTipoServicio(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTipoServicio = of(this.tipoServicio.filter(tipo =>
      tipo.nombre.toLowerCase().includes(filterValue)
    ));
  }

  shouldShowClimaInput(): boolean {
    return this.isReactivo && this.showClimaInput;
  }

  private setupActivoFijoAutocomplete() {
    this.filteredActivosFijos = this.visitaForm.get('activoFijoId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterActivosFijos(value))
    );
  }

  private _filterActivosFijos(value: any): any[] {
    if (!this.activosFijos) return [];
    
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.activosFijos.filter(activo => 
      activo.codigo_activo.toLowerCase().includes(filterValue)
    );
  }

  displayActivoFijoFn(activoFijo: any): string {
    if (activoFijo === null) return 'No aplica';
    return activoFijo ? `${activoFijo.codigo_activo} - ${activoFijo.tipo_equipo}` : '';
  }

  onActivoFijoFocus() {
    this.filteredActivosFijos = of(this.activosFijos);
  }

  filtrarActivosFijos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActivosFijos = of(
      this.activosFijos.filter(activo =>
        activo.codigo_activo.toLowerCase().includes(filterValue) ||
        activo.tipo_equipo.toLowerCase().includes(filterValue)
      )
    );
  }
}
