import { CommonModule, JsonPipe } from '@angular/common';
import { Component, LOCALE_ID, ViewChild } from '@angular/core';
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
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { MatIconModule } from '@angular/material/icon';
registerLocaleData(localeEsCl, 'es-CL');
@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [MatTableModule,MatPaginatorModule,MatSortModule,MatCardModule, MatButtonModule, CommonModule, MatFormFieldModule, MatInputModule,MatIconModule],
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'es-CL' }]
})
export class RepuestosComponent {
  displayedColumns: string[] = [ 'familia', 'articulo', 'marca', 'codigoBarra', 'precio','precioIva','precioBruto', 'precioNetoCompra','sobreprecio', 'acciones' ];
  dataSource = new MatTableDataSource<any>();
  repuestos:any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private repuestosService: RepuestosService, private router: Router) {}

  ngOnInit() {
    this.repuestosService.getRepuestos().subscribe((data) => {
      this.repuestos = data;
      //console.log('--->', this.repuestos);
      this.dataSource = new MatTableDataSource(this.repuestos);
      this.dataSource.sort = this.sort;
    });
  }
  openCrearRepuesto(){
    this.router.navigate(['/mantenedores/repuestos/crear-repuesto']);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.familia.toLowerCase().includes(filter) ||
        data.marca.toLowerCase().includes(filter) ||
        data.articulo.toLowerCase().includes(filter)
      );
    };
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'familia': return item.familia;
        case 'marca': return item.marca;
        case 'articulo': return item.articulo;
        default: return item[property];
      }
    };
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
    //console.log(repuesto);
    this.router.navigate(['/mantenedores/documentos/subir-documento', {
      tipo: 4,//repuesto 
      tecnico: null,
      cliente: null,
      repuesto: repuesto.id,
      vehiculo: null
    }]);
  }
}
