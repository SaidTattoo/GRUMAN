import { CommonModule, JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RepuestosService } from 'src/app/services/repuestos.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [JsonPipe,MatTableModule,MatPaginatorModule,MatSortModule,MatCardModule, MatButtonModule, CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.scss'
})
export class RepuestosComponent {
  displayedColumns: string[] = ['id', 'familia', 'articulo', 'marca', 'codigoBarra', 'precio', 'acciones' ];
  dataSource = new MatTableDataSource<any>();
  repuestos:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private repuestosService: RepuestosService, private router: Router) {}

  ngOnInit() {
    this.repuestosService.getRepuestos().subscribe((data) => {
      this.repuestos = data;
      console.log('--->', this.repuestos);
      this.dataSource = new MatTableDataSource(this.repuestos);
    });
  }
  openCrearRepuesto(){
    this.router.navigate(['/mantenedores/repuestos/crear-repuesto']);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  openEditarRepuestoModal(repuesto: any) {
    this.router.navigate(['/mantenedores/repuestos/editar-repuesto', repuesto.id]);
  }
  openEliminarRepuestoModal(repuesto: any) {
    Swal.fire({
      title: 'Eliminar Repuesto',
      text: '¿Estás seguro de que deseas eliminar este repuesto?',  
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.repuestosService.eliminarRepuesto(repuesto.id).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((r) => r.id !== repuesto.id);
          Swal.fire('Eliminado', 'El repuesto ha sido eliminado.', 'success');
        });
      }
    });
  }
  agregarDocumento(repuesto: any) {
    console.log(repuesto);
    this.router.navigate(['/mantenedores/documentos/subir-documento', {
      tipo: 4,//repuesto 
      tecnico: null,
      cliente: null,
      repuesto: repuesto.id,
      vehiculo: null
    }]);
  }
}
