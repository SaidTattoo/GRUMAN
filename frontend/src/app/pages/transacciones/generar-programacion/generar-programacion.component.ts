import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit,LOCALE_ID ,   } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_FORMATS, MatNativeDateModule, MAT_DATE_LOCALE ,DateAdapter} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { Subject, takeUntil, map, startWith, Observable, of } from 'rxjs';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import { TipoServicioService } from 'src/app/services/tipo-servicio.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import localeEnGb from '@angular/common/locales/en-GB';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { OrdenServicioService } from 'src/app/services/orden-servicio.service';
import { SolicitarVisitaService } from 'src/app/services/solicitar-visita.service';
import { EspecialidadesService } from 'src/app/services/especialidades.service';

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
export enum SolicitudStatus {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  EN_SERVICIO = 'en_servicio',
  FINALIZADA = 'finalizada',
  VALIDADA = 'validada',
  REABIERTA = 'reabierta',
  PROGRAMADO = 'programado'
}

@Component({
  selector: 'app-generar-programacion',
  standalone: true,
  imports: [CommonModule,MatInputModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule ,MatDatepickerModule,MatNativeDateModule, MatAutocompleteModule],
  templateUrl: './generar-programacion.component.html',
  styleUrl: './generar-programacion.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Configura el idioma para el picker
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT } // Configura los formatos personalizados
  ]
})

export class GenerarProgramacionComponent implements OnInit, OnDestroy {
  programacionForm: FormGroup;
  locales: any[] = [];
  tiposServicio: any[] = [];
  sectores: any[] = [];
  especialidades: any[] = [];
  vehiculos: any[] = [];
  clientes: any[] = [];
  loading = false;
  tecnicos: any[] = [];
  private destroy$ = new Subject<void>();
  currentUser: any;
  minDate: Date = new Date();
  filteredClientes!: Observable<any[]>;
  filteredLocales!: Observable<any[]>;
  filteredTecnicos1!: Observable<any[]>;
  filteredTecnicos2!: Observable<any[]>;
  filteredTipoServicio: Observable<any[]>;
  filteredEspecialidades: Observable<any[]>;

  constructor(
    private localesService: LocalesService,
    private tipoServicioService: TipoServicioService,
    private vehiculosService: VehiculosService,
    private programacionService: ProgramacionService,
    private clientesService: ClientesService,
    private dateAdapter: DateAdapter <Date>,
    private router: Router,
    private usersService: UsersService,
    private ordenServicioService: OrdenServicioService,
    private solicitarVisitaService: SolicitarVisitaService,
    private especialidadesService: EspecialidadesService
  ) {
    this.initForm();
    registerLocaleData(localeEnGb); 
    this.dateAdapter.setLocale('en-GB'); // Establece el idioma como 'en-GB' para formato dd/MM/yyyy
    this.getCurrentUser(); // Obtener el usuario actual
  }

  private initForm(): void {
    this.programacionForm = new FormGroup({
      clientId: new FormControl('', [Validators.required]),
      localId: new FormControl({ value: '', disabled: true }, [Validators.required]),
      tipoServicioId: new FormControl({ value: '', disabled: true }, [Validators.required]),
      sectorTrabajoId: new FormControl('', [Validators.required]),
      especialidadId: new FormControl('', [Validators.required]),
      status: new FormControl(SolicitudStatus.APROBADA, [Validators.required]),
      fechaIngreso: new FormControl('', [Validators.required]),
      tecnico_asignado_id: new FormControl('', [Validators.required]),
      tecnico_asignado_id_2: new FormControl(''),
      observaciones: new FormControl('', [Validators.maxLength(500)]),
      tipo_mantenimiento: new FormControl(SolicitudStatus.PROGRAMADO, [Validators.required])
    });

    // Agregar validación para evitar técnicos duplicados
    this.programacionForm.get('tecnico_asignado_id')?.valueChanges.subscribe(value => {
      const tecnico2Control = this.programacionForm.get('tecnico_asignado_id_2');
      if (value && tecnico2Control?.value === value && tecnico2Control) {
        tecnico2Control.setValue('');
      }
    });

    this.programacionForm.get('tecnico_asignado_id_2')?.valueChanges.subscribe(value => {
      const tecnico1Control = this.programacionForm.get('tecnico_asignado_id');
      if (value && tecnico1Control?.value === value) {
        Swal.fire({
          title: 'Error',
          text: 'Este técnico ya está seleccionado como Técnico principal',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        this.programacionForm.get('tecnico_asignado_id_2')?.setValue('');
      }
    });

    // Agregar suscripción para el autocompletado de tipo de servicio y especialidad
    this.programacionForm.get('clientId')?.valueChanges.subscribe(() => {
      this.setupTipoServicioAutocomplete();
      // Potentially reset especialidad if it depends on client? Assuming not for now.
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
    this.setupClienteAutocomplete();
    this.setupTipoServicioAutocomplete();
    this.setupEspecialidadAutocomplete();
  }

  private loadInitialData(): void {
    this.loading = true;
    Promise.all([
      this.getTiposServicio(),
      this.getSectores(),
      this.getVehiculos(),
      this.getClientes(),
      this.getLocales(),
      this.getTecnicos(),
      this.loadEspecialidades()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private setupClienteAutocomplete(): void {
    this.filteredClientes = this.programacionForm.get('clientId')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this.clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(value.toLowerCase())
          );
        }
        return this.clientes;
      })
    );
  }

  private setupFormSubscriptions(): void {
    this.programacionForm.get('clientId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((clienteId) => {
        if (clienteId) {
          this.programacionForm.get('localId')?.enable();
          this.programacionForm.get('tipoServicioId')?.enable();
          this.getLocales();
          this.programacionForm.get('localId')?.reset();
          this.programacionForm.get('tipoServicioId')?.reset();
          this.getTiposServicio();
        } else {
          this.programacionForm.get('localId')?.disable();
          this.programacionForm.get('tipoServicioId')?.disable();
          this.locales = [];
          this.tiposServicio = [];
        }
      });

    this.setupLocalAutocomplete();

    this.programacionForm.get('tecnico_asignado_id')?.valueChanges.subscribe(value => {
      const tecnico2Control = this.programacionForm.get('tecnico_asignado_id_2');
      if (value && tecnico2Control?.value === value && tecnico2Control) {
        tecnico2Control.setValue('');
      }
    });

    this.programacionForm.get('tecnico_asignado_id_2')?.valueChanges.subscribe(value => {
      const tecnico1Control = this.programacionForm.get('tecnico_asignado_id');
      if (value && tecnico1Control?.value === value) {
        Swal.fire({
          title: 'Error',
          text: 'Este técnico ya está seleccionado como Técnico principal',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
        this.programacionForm.get('tecnico_asignado_id_2')?.setValue('');
      }
    });
  }

  private setupLocalAutocomplete(): void {
    this.filteredLocales = this.programacionForm.get('localId')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
        return this.locales.filter(local =>
          local.nombre_local.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  getLocales(): void {
    const clienteId = this.programacionForm.get('clientId')?.value;
    if (clienteId) {
      this.loading = true;
      this.localesService.getLocalesByCliente(clienteId)
        .pipe(
          takeUntil(this.destroy$),
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
        .subscribe({
          next: (res: any) => {
            this.locales = res;
            this.programacionForm.get('localId')?.enable();
          },
          error: (error) => {
            this.showErrorMessage('Error al cargar los locales');
            this.programacionForm.get('localId')?.disable();
          },
          complete: () => {
            this.loading = false;
          }
        });
    } else {
      this.locales = [];
      this.programacionForm.get('localId')?.disable();
    }
  }

  getClientesFromLocalStorage(): void {
    const currentUserString = localStorage.getItem('currentUser');
    let currentUser: any = null;
    if (currentUserString) {
      currentUser = JSON.parse(currentUserString);
      this.clientes = currentUser.companies.filter((cliente: any) => cliente.id !== 5 && cliente.nombre !== 'GRUMAN');
      this.getLocales();
      if (this.clientes.length === 1) {
        const singleClient = this.clientes[0];
        this.programacionForm.get('clientId')?.setValue(singleClient.id);
        this.programacionForm.get('clientId')?.disable();
        this.getLocales();
      }
    }
  }

  getClientes(): void {
    this.clientesService.getClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.clientes = data;
          this.getLocales()
        },
        error: (error) => {
          this.showErrorMessage('Error al cargar los clientes');
        }
      });
  } 

  getTiposServicio(): void {
    const clienteId = this.programacionForm.get('clientId')?.value;
    if (clienteId) {
      this.clientesService.getCliente(clienteId)
        .pipe(
          takeUntil(this.destroy$),
          map(data => ({
            ...data,
            tipoServicio: (data.tipoServicio || []).sort((a: any, b: any) => 
              a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
            )
          }))
        )
        .subscribe({
          next: (data: any) => {
            this.tiposServicio = data.tipoServicio || [];
            console.log('Tipos de servicio cargados:', this.tiposServicio);
          },
          error: (error) => {
            console.error('Error al cargar tipos de servicio:', error);
            this.tiposServicio = [];
          }
        });
    } else {
      this.tiposServicio = [];
    }
  }

  getSectores(): void {
    this.sectores = [
      { id: 1, nombre: 'Todos' },
      { id: 2, nombre: 'Sala' },
      { id: 3, nombre: 'Trastienda' },
      { id: 4, nombre: 'Baño' },
      { id: 5, nombre: 'Cocina' },
      { id: 6, nombre: 'Muebles de Belleza' },
      { id: 7, nombre: 'Acceso' }
    ];
  }

  getVehiculos(): void {
    this.vehiculosService.getVehiculos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.vehiculos = res;
        },
        error: (error) => {
          this.showErrorMessage('Error al cargar los vehículos');
        }
      });
  }

  private getCurrentUser(): void {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      this.currentUser = JSON.parse(userString);
    }
  }

  onSubmit(): void {
    if (this.programacionForm.invalid) {
      this.markFormGroupTouched(this.programacionForm);
      this.showErrorMessage('Por favor, complete todos los campos requeridos correctamente');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres crear la programación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const formData = this.programacionForm.value;
        
        // Mantener el status original del formulario ('programada')
        const programacionData = {
          ...formData,
          aprobada_por_id: this.currentUser?.id,
          generada_por_id: this.currentUser?.id
        };
        
        this.solicitarVisitaService.crearSolicitudVisita(programacionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('Solicitud de visita creada:', res);
            Swal.fire({
              title: 'Éxito',
              html: `
                <div style="text-align: left">
                  <p><strong>Solicitud de visita generada correctamente</strong></p>
                  <p><strong>N° Requerimiento:</strong> ${res.data.id}</p>
                  <p><strong>Fecha:</strong> ${this.formatDate(new Date().toISOString())}</p>
                </div>
              `,
              icon: 'success'
            });
            this.router.navigate(['/transacciones/listado-programacion']);
          },
          error: (error) => {
            console.error('Error al crear la solicitud de visita:', error);
            const errorMsg = error.error?.message || 'El cliente ya tiene una solicitud de visita programada en este mes';
            this.showErrorMessage(errorMsg);
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
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

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: '¡Error!',
      text: message
    });
  }

  getErrorMessage(field: string): string {
    const control = this.programacionForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxlength')) {
      return 'El texto es demasiado largo';
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(){
    this.router.navigate(['/transacciones/listado-programacion']);
  }

  getTecnicos(): void {
    this.usersService.getAllTecnicos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.tecnicos = res;
      });
  }

  getTecnicosDisponiblesParaSegundoSelect(): any[] {
    const tecnico1Id = this.programacionForm.get('tecnico_asignado_id')?.value;
    return this.tecnicos.filter(tecnico => tecnico.id !== tecnico1Id);
  }

  onClienteFocus() {
    this.filteredClientes = new Observable(observer => {
      observer.next(this.clientes);
    });
  }

  filtrarClientes(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClientes = new Observable(observer => {
      observer.next(this.clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(filterValue)
      ));
    });
  }

  displayFn = (clientId: number): string => {
    const cliente = this.clientes.find(c => c.id === clientId);
    return cliente ? cliente.nombre : '';
  }

  onLocalFocus() {
    this.filteredLocales = new Observable(observer => {
      observer.next(this.locales);
    });
  }

  filtrarLocales(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredLocales = new Observable(observer => {
      observer.next(this.locales.filter(local => 
        local.nombre_local.toLowerCase().includes(filterValue)
      ));
    });
  }

  displayLocalFn = (localId: number): string => {
    const local = this.locales.find(l => l.id === localId);
    return local ? local.nombre_local : '';
  }

  onTecnico1Focus() {
    this.filteredTecnicos1 = new Observable(observer => {
      observer.next(this.tecnicos);
    });
  }

  onTecnico2Focus() {
    const tecnico1Id = this.programacionForm.get('tecnico_asignado_id')?.value;
    this.filteredTecnicos2 = new Observable(observer => {
      observer.next(this.tecnicos.filter(t => t.id !== tecnico1Id));
    });
  }

  filtrarTecnicos1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTecnicos1 = new Observable(observer => {
      observer.next(this.tecnicos.filter(tecnico => 
        `${tecnico.name} ${tecnico.lastName}`.toLowerCase().includes(filterValue)
      ));
    });
  }

  filtrarTecnicos2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    const tecnico1Id = this.programacionForm.get('tecnico_asignado_id')?.value;
    this.filteredTecnicos2 = new Observable(observer => {
      observer.next(this.tecnicos.filter(tecnico => 
        tecnico.id !== tecnico1Id && 
        `${tecnico.name} ${tecnico.lastName}`.toLowerCase().includes(filterValue)
      ));
    });
  }

  displayTecnicoFn = (tecnicoId: number): string => {
    const tecnico = this.tecnicos.find(t => t.id === tecnicoId);
    return tecnico ? `${tecnico.name} ${tecnico.lastName}` : '';
  }

  setupTipoServicioAutocomplete() {
    const tipoServicioControl = this.programacionForm.get('tipoServicioId');
    if (tipoServicioControl) {
      this.filteredTipoServicio = tipoServicioControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
          return this.tiposServicio.filter(tipo => 
            tipo.nombre.toLowerCase().includes(filterValue)
          );
        })
      );
    }
  }

  private _filterTipoServicio(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.tiposServicio.filter(tipo => 
      tipo.nombre.toLowerCase().includes(filterValue)
    );
  }

  onTipoServicioFocus() {
    this.filteredTipoServicio = of(this.tiposServicio);
  }

  displayTipoServicioFn = (tipoId: number): string => {
    if (!tipoId) return '';
    const tipo = this.tiposServicio.find(t => t.id === tipoId);
    return tipo ? tipo.nombre : '';
  }

  filtrarTipoServicio(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredTipoServicio = of(this.tiposServicio.filter(tipo => 
      tipo.nombre.toLowerCase().includes(filterValue)
    ));
  }

  loadEspecialidades(): void {
    this.especialidadesService.findAll()
      .pipe(
        map(especialidades => 
          especialidades.sort((a, b) => 
            a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
          )
        )
      )
      .subscribe({
        next: (data: any[]) => {
          this.especialidades = data;
          console.log('Especialidades cargadas:', this.especialidades);
        },
        error: (error) => {
          console.error('Error cargando especialidades:', error);
          this.showErrorMessage('Error al cargar las especialidades');
        }
      });
  }

  setupEspecialidadAutocomplete() {
    const especialidadControl = this.programacionForm.get('especialidadId');
    if (especialidadControl) {
      this.filteredEspecialidades = especialidadControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
          return this._filterEspecialidades(filterValue);
        })
      );
    }
  }

  private _filterEspecialidades(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.especialidades.filter(esp =>
      esp.nombre.toLowerCase().includes(filterValue)
    );
  }

  onEspecialidadFocus() {
    this.filteredEspecialidades = of(this.especialidades);
  }

  displayEspecialidadFn = (especialidadId: number): string => {
    if (!especialidadId) return '';
    const especialidad = this.especialidades.find(e => e.id === especialidadId);
    return especialidad ? especialidad.nombre : '';
  }

  filtrarEspecialidades(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredEspecialidades = of(this._filterEspecialidades(filterValue));
  }
}