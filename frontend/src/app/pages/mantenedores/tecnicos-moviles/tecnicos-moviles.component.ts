import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UsersService } from 'src/app/services/users.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { UserVehiculoService } from 'src/app/services/user-vehiculo.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

interface UserVehiculo {
  id: number;
  odometro_inicio: number;
  odometro_fin?: number;
  fecha_utilizado: Date;
  user: any;
  vehiculo: any;
}

@Component({
  selector: 'app-tecnicos-moviles',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    RouterModule
  ],
  templateUrl: './tecnicos-moviles.component.html',
  styleUrl: './tecnicos-moviles.component.scss'
})
export class TecnicosMovilesComponent implements OnInit {
  tecnicos: any[] = [];
  vehiculos: any[] = [];
  asignaciones: any[] = [];
  fechaHoy: Date = new Date();
  
  displayedColumnsTecnicos: string[] = ['select', 'nombre', 'especialidades'];
  displayedColumnsVehiculos: string[] = ['select', 'patente', 'marca', 'modelo', 'ultimo_odometro', 'acciones'];
  displayedColumnsAsignaciones: string[] = ['tecnico', 'vehiculo', 'fecha', 'odometro_inicio', 'odometro_fin'];

  selectionTecnicos = new SelectionModel<any>(false, []);
  selectionVehiculos = new SelectionModel<any>(false, []);

  dataSourceTecnicos: MatTableDataSource<any>;
  dataSourceVehiculos: MatTableDataSource<any>;

  constructor(
    private vehiculosService: VehiculosService, 
    private usersService: UsersService,
    private userVehiculoService: UserVehiculoService
  ){
    this.dataSourceTecnicos = new MatTableDataSource();
    this.dataSourceVehiculos = new MatTableDataSource();

    // Configurar filtro personalizado para técnicos (solo por nombre)
    this.dataSourceTecnicos.filterPredicate = (data: any, filter: string) => {
      const nombreCompleto = `${data.name} ${data.lastName}`.toLowerCase();
      return nombreCompleto.includes(filter);
    };

    // Configurar filtro personalizado para vehículos (solo por patente)
    this.dataSourceVehiculos.filterPredicate = (data: any, filter: string) => {
      return data.patente.toLowerCase().includes(filter);
    };
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loadAsignaciones();
  }

  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getFullYear() === fecha2.getFullYear() &&
           fecha1.getMonth() === fecha2.getMonth() &&
           fecha1.getDate() === fecha2.getDate();
  }

  loadAsignaciones() {
    this.userVehiculoService.getUserVehiculos().subscribe({
      next: (data: any) => {
        // Filtrar asignaciones solo del día actual
        this.asignaciones = data.filter((asignacion: any) => 
          this.esMismaFecha(new Date(asignacion.fecha_utilizado), this.fechaHoy)
        );
        this.loadTecnicos();
        this.loadVehiculos();
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
      }
    });
  }

  finalizarAsignacion(asignacion: any) {
    Swal.fire({
      title: 'Ingrese el odómetro final',
      input: 'number',
      inputLabel: 'Odómetro (km)',
      inputPlaceholder: 'Ingrese el kilometraje actual',
      showCancelButton: true,
      confirmButtonText: 'Finalizar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value:any) => {
        if (!value || value < 0) {
          return 'Debe ingresar un valor válido para el odómetro';
        }
        if (Number(value) <= asignacion.odometro_inicio) {
          return 'El odómetro final debe ser mayor al inicial';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.userVehiculoService.updateUserVehiculo(asignacion.id, {
          ...asignacion,
          odometro_fin: Number(result.value)
        }).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Asignación finalizada correctamente', 'success');
            this.loadData();
          },
          error: (error) => {
            console.error('Error al finalizar asignación:', error);
            Swal.fire('Error', 'No se pudo finalizar la asignación', 'error');
          }
        });
      }
    });
  }

  toggleTecnicoSelection(tecnico: any) {
    if (this.selectionTecnicos.isSelected(tecnico)) {
      this.selectionTecnicos.clear();
    } else {
      this.selectionTecnicos.clear();
      this.selectionTecnicos.select(tecnico);
    }
  }

  toggleVehiculoSelection(vehiculo: any) {
    if (this.selectionVehiculos.isSelected(vehiculo)) {
      this.selectionVehiculos.clear();
    } else {
      this.selectionVehiculos.clear();
      this.selectionVehiculos.select(vehiculo);
    }
  }

  isAllSelectedVehiculos() {
    const numSelected = this.selectionVehiculos.selected.length;
    const numRows = this.vehiculos.length;
    return numSelected === numRows;
  }

  masterToggleVehiculos() {
    if (this.isAllSelectedVehiculos()) {
      this.selectionVehiculos.clear();
    } else {
      this.vehiculos.forEach(row => this.selectionVehiculos.select(row));
    }
  }

  loadTecnicos() {
    this.usersService.getAllTecnicos().subscribe((data: any) => {
      this.tecnicos = data.filter((tecnico: any) => {
        const asignacionActiva = this.asignaciones.find(
          (asignacion: any) => 
            asignacion.user.id === tecnico.id && 
            !asignacion.odometro_fin &&
            this.esMismaFecha(new Date(asignacion.fecha_utilizado), this.fechaHoy)
        );
        return !asignacionActiva;
      });
      this.dataSourceTecnicos.data = this.tecnicos;
    });
  }

  loadVehiculos() {
    this.vehiculosService.getVehiculos().subscribe((data) => {
      // Obtener el último odómetro para cada vehículo
      const vehiculosPromises = data.map(async (vehiculo: any) => {
        try {
          const lastAssignment = await this.userVehiculoService.getLastAssignment(vehiculo.id).toPromise() as UserVehiculo;
          return {
            ...vehiculo,
            ultimo_odometro: lastAssignment ? lastAssignment.odometro_inicio : 0
          };
        } catch (error) {
          console.error('Error al obtener última asignación:', error);
          return {
            ...vehiculo,
            ultimo_odometro: 0
          };
        }
      });

      Promise.all(vehiculosPromises).then(vehiculosConOdometro => {
        this.vehiculos = vehiculosConOdometro.filter((vehiculo: any) => {
          const asignacionActiva = this.asignaciones.find(
            (asignacion: any) => 
              asignacion.vehiculo.id === vehiculo.id && 
              !asignacion.odometro_fin &&
              this.esMismaFecha(new Date(asignacion.fecha_utilizado), this.fechaHoy)
          );
          return !asignacionActiva;
        });
        this.dataSourceVehiculos.data = this.vehiculos;
      });
    });
  }

  asignarVehiculo(tecnico: any) {
    const tecnicoSeleccionado = this.selectionTecnicos.selected[0];
    const vehiculoSeleccionado = this.selectionVehiculos.selected[0];
    
    if (tecnicoSeleccionado && vehiculoSeleccionado) {
      // Primero obtener la última asignación para mostrar el odómetro
      this.userVehiculoService.getLastAssignment(vehiculoSeleccionado.id).subscribe({
        next: (lastAssignment: any) => {
          const lastOdometro = lastAssignment ? lastAssignment.odometro_inicio : 0;
          
          Swal.fire({
            title: 'Ingrese el odómetro inicial',
            input: 'number',
            inputLabel: `Odómetro (km)`,
            html: lastOdometro ? `<div class="mb-3">Último odómetro registrado: <strong>${lastOdometro.toLocaleString()} km</strong></div>` : '',
            inputPlaceholder: 'Ingrese el kilometraje actual',
            showCancelButton: true,
            confirmButtonText: 'Asignar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value:any) => {
              if (!value || value < 0) {
                return 'Debe ingresar un valor válido para el odómetro';
              }
              if (lastAssignment && Number(value) < lastOdometro) {
                return `El odómetro inicial no puede ser menor al último registrado (${lastOdometro.toLocaleString()} km)`;
              }
              return null;
            }
          }).then((result) => {
            if (result.isConfirmed) {
              this.userVehiculoService.createUserVehiculo({
                userId: tecnicoSeleccionado.id,
                vehiculoId: vehiculoSeleccionado.id,
                fecha_utilizado: new Date(),
                odometro_inicio: Number(result.value),
                odometro_fin: undefined
              }).subscribe({
                next: (data) => {
                  Swal.fire({
                    title: 'Asignación creada',
                    text: 'El vehículo ha sido asignado al técnico. Si existía una asignación anterior sin finalizar, se ha actualizado su odómetro final.',
                    icon: 'success'
                  });
                  this.loadData();
                },
                error: (error) => {
                  console.error('Error al asignar:', error);
                  let errorMessage = 'No se pudo realizar la asignación';
                  
                  if (error.error && error.error.message) {
                    const lastOdometro = error.error.lastOdometro;
                    errorMessage = `${error.error.message} (${lastOdometro.toLocaleString()} km)`;
                  }
                  
                  Swal.fire('Error', errorMessage, 'error');
                }
              });
            }
          });
        },
        error: (error) => {
          console.error('Error al obtener última asignación:', error);
          Swal.fire('Error', 'No se pudo obtener la información del vehículo', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Debe seleccionar un técnico y un vehículo', 'warning');
    }
  }

  verAsignaciones(tecnico: any) {
    console.log('Ver asignaciones de:', tecnico);
  }

  asignarSeleccionados() {
    const tecnicosSeleccionados = this.selectionTecnicos.selected;
    const vehiculosSeleccionados = this.selectionVehiculos.selected;

    if (tecnicosSeleccionados.length && vehiculosSeleccionados.length) {
      Swal.fire({
        title: 'Ingrese el odómetro inicial',
        input: 'number',
        inputLabel: 'Odómetro (km)',
        inputPlaceholder: 'Ingrese el kilometraje actual',
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value:any) => {
          if (!value || value < 0) {
            return 'Debe ingresar un valor válido para el odómetro';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const asignaciones = tecnicosSeleccionados.map(tecnico => {
            return vehiculosSeleccionados.map(vehiculo => ({
              userId: tecnico.id,
              vehiculoId: vehiculo.id,
              fecha_utilizado: new Date(),
              odometro_inicio: Number(result.value),
              odometro_fin: undefined
            }));
          }).flat();

          // Crear las asignaciones una por una
          const promises = asignaciones.map((asignacion:any) => 
            this.userVehiculoService.createUserVehiculo(asignacion).toPromise()
          );

          Promise.all(promises)
            .then(() => {
              Swal.fire({
                title: 'Éxito',
                text: 'Asignaciones realizadas correctamente. Si existían asignaciones anteriores sin finalizar, se han actualizado sus odómetros finales.',
                icon: 'success'
              });
              this.selectionTecnicos.clear();
              this.selectionVehiculos.clear();
              this.loadData();
            })
            .catch(error => {
              console.error('Error al asignar:', error);
              Swal.fire('Error', error.error.message || 'No se pudieron realizar las asignaciones', 'error');
            });
        }
      });
    }
  }

  applyFilterTecnicos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceTecnicos.filter = filterValue.trim().toLowerCase();
  }

  applyFilterVehiculos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceVehiculos.filter = filterValue.trim().toLowerCase();
  }
}
