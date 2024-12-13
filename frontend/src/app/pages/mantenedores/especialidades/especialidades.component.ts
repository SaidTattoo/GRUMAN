import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EspecialidadesService } from 'src/app/services/especialidades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,

  ],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.scss']
})
export class EspecialidadesComponent implements OnInit {
  displayedColumns: string[] = [ 'nombre',  'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private especialidadesService: EspecialidadesService, private router: Router) {}

  ngOnInit() {
    this.loadEspecialidades();
  }

  loadEspecialidades() {
    this.especialidadesService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }
  editarEspecialidad(especialidad: any) {
    this.router.navigate(['/mantenedores/especialidades/editar', especialidad.id]);
  }

  eliminarEspecialidad(especialidad: any) {
    console.log(especialidad);
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta especialidad?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.especialidadesService.delete(especialidad.id).subscribe(data => {
          this.loadEspecialidades();
        });
      }
    });
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  crearEspecialidad() {
    this.router.navigate(['/mantenedores/especialidades/crear']);
  }

  getEspecialidadesNombres(especialidades: any[]): string {
    return especialidades?.map(e => e.nombre).join(', ') || '';
  }
}
