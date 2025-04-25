import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RutFormatPipe } from 'src/app/pipes/rut-format.pipe';
import { TecnicosService } from 'src/app/services/tecnicos.service';
import { UsersService } from 'src/app/services/users.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tecnicos-gruman',
  standalone: true,
  imports: [ 
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatTableModule,
    RouterModule,
    MatIconModule,
    RutFormatPipe,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './tecnicos-gruman.component.html',
  styleUrl: './tecnicos-gruman.component.scss'
})
export class TecnicosGrumanComponent implements OnInit {

  constructor(private usersService: UsersService, private router: Router, private tecnicosService: TecnicosService){}
  tecnicos: any[] = [];
  dataSource: any[] = [];
  filteredData: any[] = [];
  displayedColumns: string[] = [ 'name', 'rut', 'especialidades', 'acciones'];
  
  ngOnInit(): void {
    console.log('findAllTecnicos');
    this.loadTecnicos();
  }

  applyFilter(event: Event, filterType: 'name' | 'rut'): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    
    if (!filterValue) {
      this.dataSource = [...this.tecnicos];
      return;
    }
    
    this.dataSource = this.tecnicos.filter(tecnico => {
      if (filterType === 'name') {
        const fullName = `${tecnico.name} ${tecnico.lastName}`.toLowerCase();
        return fullName.includes(filterValue);
      } else if (filterType === 'rut') {
        return tecnico.rut?.toLowerCase().includes(filterValue);
      }
      return true;
    });
  }
  
  getEspecialidadesNombres(especialidades: any[]): string {
    if (!especialidades || especialidades.length === 0) {
      return 'Sin especialidad';
    }
    return especialidades.map(e => e.nombre).join(', ');
  }
  createTecnicoGruman() {
    this.router.navigate(['/mantenedores/tecnicos-gruman/crear-tecnico-gruman']);
  }
  editTecnicoGruman(tecnico: any) {
    this.router.navigate(['/mantenedores/tecnicos-gruman/editar-tecnico-gruman', tecnico.id]);
  }
  deleteTecnicoGruman(tecnico: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al técnico ${tecnico.name} ${tecnico.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tecnicosService.deleteTecnico(tecnico.id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El técnico ha sido eliminado correctamente.',
              'success'
            );
            this.loadTecnicos();
          },
          error: (error) => {
            Swal.fire(
              'Error',
              'No se pudo eliminar el técnico.',
              'error'
            );
            console.error('Error al eliminar técnico:', error);
          }
        });
      }
    });
  }
  private loadTecnicos() {
    this.usersService.getAllTecnicos().subscribe({
      next: (tecnicos: any) => {
        this.tecnicos = tecnicos;
        this.dataSource = this.tecnicos;
      },
      error: (error) => {
        console.error('Error al cargar técnicos:', error);
        Swal.fire(
          'Error',
          'No se pudieron cargar los técnicos.',
          'error'
        );
      }
    });
  }
  cambiarPassword(tecnico: any) {
    this.router.navigate(['/mantenedores/usuarios/cambiar-password', { tecnico: tecnico.id }]);
  }

  exportarExcel(): void {
    if (!this.dataSource || this.dataSource.length === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No hay datos para exportar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Preparar los datos para exportar
    const datosParaExportar = this.dataSource.map(tecnico => ({
      'Nombre': `${tecnico.name} ${tecnico.lastName}`,
      'RUT': tecnico.rut,
      'Especialidades': this.getEspecialidadesNombres(tecnico.especialidades),
      'Email': tecnico.email || 'No asignado',
      'Teléfono': tecnico.telefono || 'No asignado',
     
    }));

    // Crear el libro de trabajo y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosParaExportar);

    // Establecer anchos de columna
    const wscols = [
      { wch: 30 }, // Nombre
      { wch: 15 }, // RUT
      { wch: 40 }, // Especialidades
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
     
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Técnicos');

    // Generar el archivo y descargarlo
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `Tecnicos_${fecha}.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Mostrar mensaje de éxito
    Swal.fire({
      title: 'Éxito',
      text: 'El archivo Excel se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
