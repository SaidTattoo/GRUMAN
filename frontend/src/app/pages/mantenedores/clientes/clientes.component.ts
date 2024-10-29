import { JsonPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [JsonPipe,MatTableModule,MatPaginatorModule,MatSortModule,MatInputModule,MatFormFieldModule,MatCard,MatCardContent, MatIcon, MatButton, MatCardHeader  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  displayedColumns: string[] = [ 'nombre', 'rut', 'razonSocial', 'logo', 'sobrePrecio', 'valorPorLocal', 'acciones'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private clientesService: ClientesService, public dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.clientesService.getClientes().subscribe((data) => {
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
  formatRut(rut: string): string {
    // Implementa aquí la lógica para formatear el RUT
    if (!rut) return '';
    // Ejemplo simple de formateo: 12345678-9 -> 12.345.678-9
    return rut.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  }
  openCrearClienteModal() {
    //redireccionar a la ruta de crear cliente
    this.router.navigate(['/mantenedores/clientes/crear']);
  }
  openEditarClienteModal(cliente: any) {
    this.router.navigate(['/mantenedores/clientes/editar', cliente.id]);
  }
  openEliminarClienteModal(cliente: any) {
    Swal.fire({
      title: 'Eliminar Cliente',
      text: '¿Estás seguro de que deseas eliminar este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientesService.deleteCliente(cliente.id).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter((c) => c.id !== cliente.id);
          Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
        });
      }
    });
  }
}
