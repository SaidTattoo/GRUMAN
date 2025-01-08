import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { ProgramacionService } from 'src/app/services/programacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listado-programacion',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, DatePipe, MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './listado-programacion.component.html',
  styleUrl: './listado-programacion.component.scss'
})
export class ListadoProgramacionComponent implements OnInit {
  constructor(private programacionService: ProgramacionService, private router: Router, private clienteService: ClientesService) { }
  displayedColumns: string[] = ['clienteId', 'local', 'sectorTrabajo', 'tipoServicio', 'fecha', 'observaciones', 'tecnico', 'acciones'];

  dataSource: any;


  clientes: any;

  ngOnInit() {
    this.getProgramacion();
  }


  getProgramacion() {
    this.programacionService.getProgramacion().subscribe((res: any) => {
      //console.log(res);
      this.dataSource = res;
    });
  }


  newProgramacion() {
    this.router.navigate(['/generar-programacion']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openEditarModal(programacion: any) {
    this.router.navigate(['/transacciones/listado-programacion/editar-programacion', programacion.id]);
       
    
    
  }

  openEliminarModal(programacion: any) {
   Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
   }).then((result) => {
    if (result.isConfirmed) {
      this.programacionService.deleteProgramacion(programacion.id).subscribe(response => {
        //console.log(response);
      this.getProgramacion();
      });
    }
   });
  }
}
