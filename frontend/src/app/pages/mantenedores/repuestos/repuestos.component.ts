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
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, state, style, transition, trigger } from '@angular/animations';
import Swal from 'sweetalert2';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { MatDialog } from '@angular/material/dialog';
import { HistorialDialogComponent } from './historial-dialog/historial-dialog.component';

registerLocaleData(localeEsCl, 'es-CL');

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'es-CL' }],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RepuestosComponent {
  displayedColumns: string[] = ['expand', 'familia', 'articulo', 'marca', 'codigoBarra', 'precio_compra', 'precio_venta', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  clientPricesDataSource = new MatTableDataSource<any>();
  repuestos: any = [];
  expandedElement: any | null = null;
  loadingClientPrices = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private repuestosService: RepuestosService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadRepuestos();
  }

  loadRepuestos() {
    this.repuestosService.getRepuestos().subscribe((data) => {
      this.repuestos = data;
      this.dataSource = new MatTableDataSource(this.repuestos);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  expandRow(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
    if (this.expandedElement) {
      this.loadClientPrices(element.id);
    }
  }

  loadClientPrices(repuestoId: number) {
    this.loadingClientPrices = true;
    this.repuestosService.getClientePreciosForRepuesto(repuestoId).subscribe({
      next: (data) => {
        this.clientPricesDataSource.data = data;
        this.loadingClientPrices = false;
      },
      error: (error) => {
        console.error('Error loading client prices:', error);
        this.loadingClientPrices = false;
        Swal.fire('Error', 'No se pudieron cargar los precios por cliente', 'error');
      }
    });
  }

  async updateClientPrice(precio: any) {
    Swal.fire({
      title: 'Guardando...',
      text: 'Actualizando precios del cliente',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const updateData = {
      precio_venta: precio.precio_venta,
      precio_compra: precio.precio_compra
    };

    this.repuestosService.updateClienteRepuesto(precio.id, updateData).subscribe({
      next: () => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'Los precios se han actualizado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error updating client price:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron actualizar los precios. Por favor, intente nuevamente.'
        });
      }
    });
  }

  verHistorial(precio: any) {
    this.repuestosService.getHistorialClienteRepuesto(precio.id).subscribe({
      next: (historial) => {
        this.dialog.open(HistorialDialogComponent, {
          width: '900px',
          data: { historial }
        });
      },
      error: (error) => {
        console.error('Error loading price history:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el historial de precios'
        });
      }
    });
  }

  openCrearRepuesto() {
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

  sincronizarClientesRepuestos() {
    Swal.fire({
      title: '¿Sincronizar precios?',
      text: 'Se crearán precios para los clientes que no tengan precios asignados en los repuestos. ¿Desea continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, sincronizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Sincronizando...',
          text: 'Por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.repuestosService.sincronizarClientesRepuestos().subscribe({
          next: (response) => {
            if (response.creados === 0) {
              Swal.fire({
                title: 'Información',
                text: 'No se encontraron precios nuevos para sincronizar',
                icon: 'info'
              });
            } else {
              Swal.fire({
                title: 'Éxito',
                text: `Se han sincronizado ${response.creados} precios de clientes`,
                icon: 'success'
              });
            }
            // Recargar los datos
            this.loadRepuestos();
          },
          error: (error) => {
            console.error('Error sincronizando precios:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.message || 'No se pudieron sincronizar los precios de clientes',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}
