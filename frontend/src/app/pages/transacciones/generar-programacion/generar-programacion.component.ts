import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
export class GenerarProgramacionComponent {
  programacionForm: FormGroup;
  locales: any[] = [];
  tiposServicio: any[] = [];
  sectores: any[] = [];
  vehiculos: any[] = [];
  constructor(private localesService: LocalesService, private tipoServicioService: TipoServicioService, private vehiculosService: VehiculosService, private programacionService: ProgramacionService) {
    this.programacionForm = new FormGroup({
      local: new FormControl('', Validators.required),
      tipoServicio: new FormControl('', Validators.required),
      sectorTrabajo: new FormControl('', Validators.required),
      fecha: new FormControl('', Validators.required),
      vehiculo: new FormControl('', Validators.required),
      patente: new FormControl(''),
      observaciones: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.getLocales();
    this.getTiposServicio();
    this.getSectores();
    this.getVehiculos();
  }

  getLocales(): void {
    this.localesService.getLocales().subscribe((res: any) => {
      this.locales = res;
    });
  } 

  getTiposServicio(): void {
    this.tipoServicioService.findAll().subscribe((data) => {
      this.tiposServicio = data;
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
    this.vehiculosService.getVehiculos().subscribe((res: any) => {
      this.vehiculos = res;
    });
  }
  onFileSelected(event: any): void {
    console.log(event);
  }
  onSubmit(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres crear la programación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.programacionService.createProgramacion(this.programacionForm.value).subscribe((res: any) => {
          console.log(res);
    });
      }
    });
  }
}
