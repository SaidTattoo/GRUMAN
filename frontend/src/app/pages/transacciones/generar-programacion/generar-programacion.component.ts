import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-generar-programacion',
  standalone: true,
  imports: [CommonModule,MatInputModule, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule ,MatDatepickerModule,MatNativeDateModule],
  templateUrl: './generar-programacion.component.html',
  styleUrl: './generar-programacion.component.scss'
})
export class GenerarProgramacionComponent implements OnInit, OnDestroy {
  programacionForm: FormGroup;
  locales: any[] = [];
  tiposServicio: any[] = [];
  sectores: any[] = [];
  vehiculos: any[] = [];
  clientes: any[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private localesService: LocalesService,
    private tipoServicioService: TipoServicioService,
    private vehiculosService: VehiculosService,
    private programacionService: ProgramacionService,
    private clientesService: ClientesService
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.programacionForm = new FormGroup({
      clienteId: new FormControl('', [Validators.required]),
      local: new FormControl({ value: '', disabled: true }, [Validators.required]),
      tipoServicio: new FormControl('', [Validators.required]),
      sectorTrabajo: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required, this.fechaValidator]),
      vehiculo: new FormControl('', [Validators.required]),
      observaciones: new FormControl('', [Validators.maxLength(500)])
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
      this.getClientes()
    ]).finally(() => {
      this.loading = false;
    });
  }

  private setupFormSubscriptions(): void {
    this.programacionForm.get('clienteId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((clienteId) => {
        if (clienteId) {
          this.programacionForm.get('local')?.enable();
          this.getLocales();
          this.programacionForm.get('local')?.reset();
        } else {
          this.programacionForm.get('local')?.disable();
          this.locales = [];
        }
      });
  }

  fechaValidator(control: FormControl): {[key: string]: any} | null {
    const fecha = new Date(control.value);
    const hoy = new Date();
    if (fecha < hoy) {
      return { 'fechaPasada': true };
    }
    return null;
  }

  getErrorMessage(controlName: string): string {
    const control = this.programacionForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxlength')) {
      return 'Máximo 500 caracteres permitidos';
    }
    if (control?.hasError('fechaPasada')) {
      return 'La fecha no puede ser anterior a hoy';
    }
    return '';
  }

  getLocales(): void {
    const clienteId = this.programacionForm.get('clienteId')?.value;
    if (clienteId) {
      this.loading = true;
      this.localesService.getLocalesByCliente(clienteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.locales = res;
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

  getClientes(): void {
    this.clientesService.getClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.clientes = data;
        },
        error: (error) => {
          this.showErrorMessage('Error al cargar los clientes');
        }
      });
  }

  getTiposServicio(): void {
    this.tipoServicioService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.tiposServicio = data;
        },
        error: (error) => {
          this.showErrorMessage('Error al cargar los tipos de servicio');
        }
      });
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
        this.programacionService.createProgramacion(this.programacionForm.value)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: any) => {
              this.showSuccessMessage('Programación creada exitosamente');
              this.programacionForm.reset();
            },
            error: (error) => {
              this.showErrorMessage('Error al crear la programación');
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
      title: 'Error',
      text: message
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}