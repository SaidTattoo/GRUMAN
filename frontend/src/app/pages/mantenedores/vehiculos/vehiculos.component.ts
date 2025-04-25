import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { CrearVehiculoComponent } from './crear-vehiculo/crear-vehiculo.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface Vehiculo {
  id: number;
  movil: string;
  patente: string;
  marca: string;
  modelo: string;
  documentacion: {
    revision_tecnica: string;
    gases: string;
    seguro_obligatorio: string;
    padron_vehicular: string;
  };
  activo: boolean;
}
const ELEMENT_DATA: any[] = [
  {
    id: 1,
    imagePath: 'assets/images/profile/user-1.jpg',
    uname: 'Sunil Joshi',
    position: 'Web Designer',
    productName: 'Elite Admin',
    budget: 3.9,
    priority: 'low',
  },
  {
    id: 2,
    imagePath: 'assets/images/profile/user-2.jpg',
    uname: 'Andrew McDownland',
    position: 'Project Manager',
    productName: 'Real Homes Theme',
    budget: 24.5,
    priority: 'medium',
  },
  {
    id: 3,
    imagePath: 'assets/images/profile/user-3.jpg',
    uname: 'Christopher Jamil',
    position: 'Project Manager',
    productName: 'MedicalPro Theme',
    budget: 12.8,
    priority: 'high',
  },
  {
    id: 4,
    imagePath: 'assets/images/profile/user-4.jpg',
    uname: 'Nirav Joshi',
    position: 'Frontend Engineer',
    productName: 'Hosting Press HTML',
    budget: 2.4,
    priority: 'critical',
  },
];
@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.component.html',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatButtonModule, JsonPipe, MatIconModule, MatTooltipModule,CommonModule,MatBadgeModule,MatTooltipModule,],
  styleUrls: ['./vehiculos.component.scss']
})
export class VehiculosComponent implements OnInit {
   displayedColumns: string[] = ['movil', 'patente', 'marca', 'modelo', 'documentacion' , 'estado' ,'acciones'];
  data: Vehiculo[] = [];
 /*  displayedColumns: string[] = ['id', 'direccion', 'comuna', 'region', 'zona', 'grupo', 'referencia', 'telefono', 'email_local', 'email_encargado', 'nombre_encargado']; */
  dataSource = new MatTableDataSource();
  constructor(private vehiculosService: VehiculosService, private dialog: MatDialog , private router: Router) {}

  ngOnInit() {
    this.vehiculosService.getVehiculos().subscribe(data => {
      this.data = data.map(vehiculo => {
        if (typeof vehiculo.documentacion === 'string') {
          vehiculo.documentacion = JSON.parse(vehiculo.documentacion);
        }
        return vehiculo;
      });
      this.dataSource.data = this.data;
      //console.log(this.data);
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  //AL CERRAR EL MODAL QUE ACTUALICE LA TABLA DE DATOS
  modalNuevoLocal(){
    this.router.navigate(['/mantenedores/vehiculos/crear-vehiculo']);
  }
  formatPatente(patente: string): string {
    return patente.replace(/(.{2})(?=.)/g, '$1<span class="dot">·</span>');
  }

  getDocumentacionKeys(documentacion: any): string[] {
    return documentacion ? Object.keys(documentacion) : [];
  }

  getIconName(key: string): string {
    const iconMap: { [key: string]: string } = {
      revision_tecnica: 'description', // Icono para revisión técnica
      gases: 'cloud', // Icono para gases
      permiso_circulacion: 'directions_car', // Icono para permiso de circulación
      seguro_obligatorio: 'verified_user' // Icono para seguro obligatorio
    };
    return iconMap[key] || 'insert_drive_file'; // Icono por defecto
  }
  getDocumentacion(vehiculo: Vehiculo): string {
    return vehiculo.documentacion ? JSON.stringify(vehiculo.documentacion) : 'No documentos';
  }

  openDocumentacion(id: number){
    this.router.navigate(['/mantenedores/vehiculos/documentacion', id]);
  }
  verVehiculo(element: any) {
    console.log('Ruta ver vehículo:', `/mantenedores/vehiculos/ver-vehiculo/${element.id}`);
    this.router.navigate([`/mantenedores/vehiculos/ver-vehiculo/${element.id}`]);
  }

  asignarTecnico(element: any) {
    console.log('Ruta asignar técnico:', `/mantenedores/vehiculos/asignar-tecnico/${element.id}`);
    this.router.navigate([`/mantenedores/vehiculos/asignar-tecnico/${element.id}`]);
  }
  eliminarVehiculo(id: number){
    this.vehiculosService.deleteVehiculo(id).subscribe(() => {
      this.ngOnInit();
    });
  }

  exportarExcel(): void {
    if (!this.dataSource.data || (this.dataSource.data as any[]).length === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No hay datos para exportar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Preparar los datos para exportar
    const datosParaExportar = (this.dataSource.data as Vehiculo[]).map(vehiculo => ({
      'Móvil': vehiculo.movil || 'No asignado',
      'Patente': vehiculo.patente || 'No asignado',
      'Marca': vehiculo.marca || 'No asignado',
      'Modelo': vehiculo.modelo || 'No asignado',
      'Estado': vehiculo.activo ? 'Activo' : 'Inactivo',
      'Revisión Técnica': vehiculo.documentacion?.revision_tecnica || 'No disponible',
      'Certificado de Gases': vehiculo.documentacion?.gases || 'No disponible',
      'Seguro Obligatorio': vehiculo.documentacion?.seguro_obligatorio || 'No disponible',
      'Padrón Vehicular': vehiculo.documentacion?.padron_vehicular || 'No disponible'
    }));

    // Crear el libro de trabajo y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosParaExportar);

    // Establecer anchos de columna
    const wscols = [
      { wch: 15 }, // Móvil
      { wch: 12 }, // Patente
      { wch: 15 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 10 }, // Estado
      { wch: 20 }, // Revisión Técnica
      { wch: 20 }, // Certificado de Gases
      { wch: 20 }, // Seguro Obligatorio
      { wch: 20 }  // Padrón Vehicular
  
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Vehículos');

    // Generar el archivo y descargarlo
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `Vehiculos_${fecha}.xlsx`;
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
