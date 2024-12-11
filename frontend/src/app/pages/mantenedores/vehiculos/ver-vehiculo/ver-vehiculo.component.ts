import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-vehiculo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './ver-vehiculo.component.html',
  styleUrl: './ver-vehiculo.component.scss'
})
export class VerVehiculoComponent implements OnInit  {
  vehiculo: any = {};
  constructor(private vehiculosService: VehiculosService, private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vehiculosService.getVehiculoById(params['id']).subscribe(vehiculo => {
          this.vehiculo = vehiculo;
        });
      }
    });
  }
  formatPatente(patente: string): string {
    return patente.replace(/(.{2})(?=.)/g, '$1<span class="dot">·</span>');
  }
  ngOnInit(): void {
    
  }
  quitarTecnico() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas quitar el técnico asignado al vehículo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculosService.removeUserVehiculo(this.vehiculo.id).subscribe({
          next: () => {
            this.vehiculo.user_id = null;
            Swal.fire('Éxito', 'Técnico removido exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error al quitar técnico:', error);
            Swal.fire('Error', 'No se pudo quitar el técnico', 'error');
          }
        });
      }
    });
  }
  volver(){
    this.router.navigate(['/mantenedores/vehiculos']);
  }
}
