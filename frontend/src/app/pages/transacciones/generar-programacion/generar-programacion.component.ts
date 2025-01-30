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

import { Subject, takeUntil } from 'rxjs';
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
@Component({
  selector: 'app-generar-programacion',
  standalone: true,
  imports: [CommonModule,MatInputModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule ,MatDatepickerModule,MatNativeDateModule],
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
  vehiculos: any[] = [];
  clientes: any[] = [];
  loading = false;
  tecnicos: any[] = [];
  private destroy$ = new Subject<void>();
  currentUser: any;
  minDate: Date = new Date();

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
    private solicitarVisitaService: SolicitarVisitaService
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
      tipoServicioId: new FormControl('', [Validators.required]),
      sectorTrabajoId: new FormControl('', [Validators.required]),
      status: new FormControl('aprobada', [Validators.required]),
      fechaIngreso: new FormControl('', [Validators.required]),
      tecnico_asignado_id: new FormControl('', [Validators.required]),
      observaciones: new FormControl('', [Validators.maxLength(500)]),
      tipo_mantenimiento: new FormControl('programado', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  private loadInitialData(): void {
    this.loading = true;
    Promise.all([
      this.getTiposServicio(),
      this.getSectores(),
      this.getVehiculos(),
      this.getClientes(),
        /*this.getClientesFromLocalStorage(), */
      this.getLocales(),
      this.getTecnicos()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private setupFormSubscriptions(): void {
    this.programacionForm.get('clientId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((clienteId) => {
        if (clienteId) {
          this.programacionForm.get('localId')?.enable();
          this.getLocales();
          this.programacionForm.get('localId')?.reset();
          this.programacionForm.get('tipoServicio')?.reset();
          this.getTiposServicio();
        } else {
          this.programacionForm.get('localId')?.disable();
          this.locales = [];
          this.tiposServicio = [];
        }
      });
  }

  getLocales(): void {
    const clienteId = this.programacionForm.get('clientId')?.value;
    if (clienteId) {
      this.loading = true;
      this.localesService.getLocalesByCliente(clienteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.locales = res;
            //console.log('Locales cargados:', this.locales);
            this.programacionForm.get('localId')?.enable(); // Asegúrate de habilitar el campo
          },
          error: (error) => {
            this.showErrorMessage('Error al cargar los locales');
          },
          complete: () => {
            this.loading = false;
          }
        });
    }
  }

  /* obtener los clientes del localstorage  SI SOLO TIENE UN CLIENTE  DEJARLO SELECCIONADO Y DISABLED EL INPUT */
  getClientesFromLocalStorage(): void {
    const currentUserString = localStorage.getItem('currentUser');
    let currentUser: any = null;
    if (currentUserString) {
      currentUser = JSON.parse(currentUserString);
      //console.log('------------->', currentUser.companies);
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
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            this.tiposServicio = data.tipoServicio || [];
            console.log('Tipos de servicio cargados:', this.tiposServicio);
          },
          error: (error) => {
            console.error('Error al cargar tipos de servicio:', error);
            this.showErrorMessage('Error al cargar los tipos de servicio');
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
          aprobada_por_id: this.currentUser?.id
        };
        
        this.solicitarVisitaService.crearSolicitudVisita(programacionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            console.log('Solicitud de visita creada:', res);
            this.router.navigate(['/transacciones/listado-programacion']);
          },
          error: (error) => {
            console.error('Error al crear la solicitud de visita:', error);
            this.showErrorMessage('Error al crear la solicitud de visita');
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
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
}