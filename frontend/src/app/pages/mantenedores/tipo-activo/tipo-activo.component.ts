import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { TipoActivoService } from 'src/app/services/tipo-activo.service';
import Swal from 'sweetalert2';
import { CrearTipoActivoComponent } from './crear-tipo-activo/crear-tipo-activo.component';


@Component({
  selector: 'app-tipo-activo',
  standalone: true,
  imports: [ CommonModule, MaterialModule, ReactiveFormsModule ],
  templateUrl: './tipo-activo.component.html',
  styleUrl: './tipo-activo.component.scss'
})
export class TipoActivoComponent implements OnInit {

  displayedColumns: string[] = ['nombre','acciones'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tiposActivoService: TipoActivoService, public dialog: MatDialog) {}

  ngOnInit() {
    this.tiposActivoService.getTiposActivo().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  editar(element: any) {
    // Lógica para editar el elemento
    //console.log('Editar', element);
    // Aquí puedes abrir un modal o navegar a una página de edición
  }

  eliminar(element: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para eliminar el elemento
        //console.log('Eliminar', element);
        // Aquí puedes llamar a un servicio para eliminar el elemento del backend
        this.tiposActivoService.eliminarTipoActivo(element.id).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== element.id);
          Swal.fire(
            'Eliminado!',
            'El tipo de activo ha sido eliminado.',
            'success'
          );
        });
      }
    });
  }

  openCrearTipoActivoModal() {
    const dialogRef = this.dialog.open(CrearTipoActivoComponent,{

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tiposActivoService.getTiposActivo().subscribe(data => {
          this.dataSource.data = data;
        });
      }
    });
  }
}
