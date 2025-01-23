import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormGroup, FormBuilder } from '@angular/forms';
import { UserVehiculoService } from 'src/app/services/user-vehiculo.service';

interface HistorialItem {
  id: number;
  userId: number;
  vehiculoId: number;
  fecha_utilizado: Date;
  odometro_inicio: number;
  odometro_fin: number | null;
  activo: boolean;
  user: {
    id: number;
    name: string;
    lastName: string;
  };
  vehiculo: {
    id: number;
    movil: string;
    patente: string;
    marca: string;
    modelo: string;
  };
  kilometraje?: number | null;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  displayedColumns: string[] = ['tecnico', 'vehiculo', 'fecha', 'odometro_inicio', 'odometro_fin', 'kilometraje'];
  dataSource: MatTableDataSource<HistorialItem>;
  filtroForm: FormGroup;

  constructor(
    private userVehiculoService: UserVehiculoService,
    private fb: FormBuilder
  ) {
    this.dataSource = new MatTableDataSource<HistorialItem>([]);
    this.filtroForm = this.fb.group({
      fechaInicio: [null],
      fechaFin: [null],
      tecnico: [''],
      vehiculo: ['']
    });
  }

  ngOnInit() {
    this.cargarHistorial();
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  cargarHistorial() {
    this.userVehiculoService.getUserVehiculos().subscribe({
      next: (data: any[]) => {
        if (data && Array.isArray(data)) {
          this.dataSource.data = data.map(item => ({
            ...item,
            kilometraje: item.odometro_fin ? item.odometro_fin - item.odometro_inicio : null
          }));
          this.aplicarFiltros();
        }
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.dataSource.data = [];
      }
    });
  }

  aplicarFiltros() {
    const filtros = this.filtroForm.value;
    
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchTecnico = !filtros.tecnico || 
        (data.user.name + ' ' + data.user.lastName)
          .toLowerCase()
          .includes(filtros.tecnico.toLowerCase());
      
      const matchVehiculo = !filtros.vehiculo || 
        data.vehiculo.patente
          .toLowerCase()
          .includes(filtros.vehiculo.toLowerCase());
      
      const fecha = new Date(data.fecha_utilizado);
      const matchFechaInicio = !filtros.fechaInicio || 
        fecha >= new Date(filtros.fechaInicio);
      
      const matchFechaFin = !filtros.fechaFin || 
        fecha <= new Date(filtros.fechaFin);

      return matchTecnico && matchVehiculo && matchFechaInicio && matchFechaFin;
    };

    this.dataSource.filter = JSON.stringify(filtros);
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      fechaInicio: null,
      fechaFin: null,
      tecnico: '',
      vehiculo: ''
    });
  }
} 