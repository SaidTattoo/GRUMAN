import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/services/clientes.service';
import { LocalesService } from 'src/app/services/locales.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatTableModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  templateUrl: './locales.component.html',
  styleUrl: './locales.component.scss'
})
export class LocalesComponent implements OnInit {
  displayedColumns: string[] = ['cliente', 'nombre_local', 'direccion', 'comuna', 'region', 'sobreprecio', 'valorPorLocal', 'telefono', 'email_local', 'email_encargado', 'nombre_encargado', 'latitud', 'longitud', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  
  // Paginación
  totalLocales = 0;
  pageSize = 10;
  currentPage = 0;
  
  // Filtros
  filterForm: FormGroup;
  clientes: any[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private localesService: LocalesService, 
    private clientesService: ClientesService,
    private dialog: MatDialog, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      clientId: ['']
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadLocales();
    
    // Suscribirse a cambios en los filtros
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 0;
      this.loadLocales();
    });
  }
  
  loadClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  loadLocales() {
    const filters = this.filterForm.value;
    
    this.localesService.getLocalesPaginados(
      this.currentPage + 1,
      this.pageSize,
      filters.clientId,
      filters.search
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalLocales = response.total;
      },
      error: (error) => {
        console.error('Error al cargar locales:', error);
        Swal.fire('Error', 'No se pudieron cargar los locales', 'error');
      }
    });
  }
  
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLocales();
  }

  resetFilters() {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadLocales();
  }

  modalEditarLocal(local: any) {
    this.router.navigate(['/mantenedores/locales/editar', local.id]);
  }

  modalNuevoLocal() {
    this.router.navigate(['/mantenedores/locales/crear']);
  }

  deleteLocal(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.localesService.deleteLocal(id).subscribe({
          next: () => {
            this.loadLocales(); // Recargar la lista después de eliminar
            Swal.fire(
              'Eliminado!',
              'El local ha sido eliminado.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire(
              'Error!',
              'No se pudo eliminar el local.',
              'error'
            );
          }
        });
      }
    });
  }

  exportarExcel() {
    if (!this.dataSource || !this.dataSource.data || this.dataSource.data.length === 0) {
      Swal.fire({
        title: 'No hay datos',
        text: 'No hay locales para exportar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Preparar los datos para el Excel
    const datosParaExportar = this.dataSource.data.map(local => ({
      'Cliente': local.client?.nombre || 'No asignado',
      'Nombre Local': local.nombre_local || 'No asignado',
      'Dirección': local.direccion || 'No asignado',
      'Comuna': local.comuna?.comuna_nombre || 'No asignado',
      'Región': local.region?.region_nombre || 'No asignado',
      'Sobreprecio': `${local.sobreprecio || 0}%`,
      'Valor Local': local.valorPorLocal ? `$${local.valorPorLocal.toLocaleString('es-CL')}` : '$0',
      'Teléfono': local.telefono || 'No asignado',
      'Email Local': local.email_local || 'No asignado',
      'Email Encargado': local.email_encargado || 'No asignado',
      'Nombre Encargado': local.nombre_encargado || 'No asignado',
      'Latitud': local.latitud || 'No asignado',
      'Longitud': local.longitud || 'No asignado'
    }));

    // Crear el libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar el ancho de las columnas
    const columnsWidths = [
      { wch: 30 }, // Cliente
      { wch: 30 }, // Nombre Local
      { wch: 40 }, // Dirección
      { wch: 20 }, // Comuna
      { wch: 25 }, // Región
      { wch: 15 }, // Sobreprecio
      { wch: 15 }, // Valor Local
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Email Local
      { wch: 30 }, // Email Encargado
      { wch: 30 }, // Nombre Encargado
      { wch: 15 }, // Latitud
      { wch: 15 }, // Longitud
    ];
    worksheet['!cols'] = columnsWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Locales');

    // Generar el archivo y descargarlo
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Locales_${fecha}.xlsx`);

    // Mostrar mensaje de éxito
    Swal.fire({
      title: '¡Éxito!',
      text: 'El archivo Excel se ha descargado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
