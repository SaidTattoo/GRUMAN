import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ActivoFijoLocalService } from 'src/app/services/activo-fijo-local.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-activo-fijo-local',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './activo-fijo-local.component.html',
  styleUrl: './activo-fijo-local.component.scss'
})
export class ActivoFijoLocalComponent implements OnInit {
  displayedColumns: string[] = ['cliente', 'local', 'tipoActivo', 'tipoEquipo', 'marca', 'PotenciaEquipo', 'refrigerante', 'on-off-inverter', 'suministra', 'codigo', 'acciones'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  constructor(private activoFijoLocalService: ActivoFijoLocalService, private router: Router) { }

  ngOnInit(): void {
    this.activoFijoLocalService.listar().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  exportarExcel(): void {
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'No hay datos para exportar',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Preparar los datos para exportar
    const datosParaExportar = this.dataSource.data.map(item => ({
      'Cliente': item.client?.nombre || 'No asignado',
      'Local': item.locales?.nombre_local || 'No asignado',
      'Tipo Activo': item.tipoActivo?.name || 'No asignado',
      'Tipo Equipo': item.tipo_equipo || 'No asignado',
      'Marca': item.marca || 'No asignado',
      'Potencia Equipo': item.potencia_equipo || 'No asignado',
      'Refrigerante': item.refrigerante || 'No asignado',
      'On-Off/Inverter': item.on_off_inverter || 'No asignado',
      'Suministra': item.suministra || 'No asignado',
      'Código': item.codigo_activo || 'No asignado'
    }));

    // Crear el libro de trabajo y la hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosParaExportar);

    // Establecer anchos de columna
    const wscols = [
      { wch: 20 }, // Cliente
      { wch: 20 }, // Local
      { wch: 15 }, // Tipo Activo
      { wch: 15 }, // Tipo Equipo
      { wch: 15 }, // Marca
      { wch: 15 }, // Potencia Equipo
      { wch: 15 }, // Refrigerante
      { wch: 15 }, // On-Off/Inverter
      { wch: 15 }, // Suministra
      { wch: 15 }  // Código
    ];
    ws['!cols'] = wscols;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Activos Fijos');

    // Generar el archivo y descargarlo
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `Activos_Fijos_${fecha}.xlsx`;
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

  editar(activoFijoLocal: any) {
    this.router.navigate(['/mantenedores/activo-fijo-local/editar', activoFijoLocal.id]);
  }

  eliminar(activoFijoLocal: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activoFijoLocalService.eliminar(activoFijoLocal.id).subscribe(data => {
          this.dataSource.data = this.dataSource.data.filter(item => item.id !== activoFijoLocal.id);
        });
      }
    });
  }
  crear() {
    this.router.navigate(['/mantenedores/activo-fijo-local/crear']);
  }

  generarReporte() {
    alert('Generar reporte');
  }

}
