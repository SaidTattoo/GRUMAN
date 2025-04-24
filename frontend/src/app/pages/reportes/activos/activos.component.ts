import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportesService } from '../reportes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './activos.component.html',
  styleUrls: ['./../reportes.component.scss']
})
export class ActivosComponent implements OnInit {
  constructor(private readonly router: Router, private readonly reportesService: ReportesService) { }

  ngOnInit(): void {
    this.generarReporte();
  }

  generarReporte(): void {
    this.reportesService.generarReporteExcel().subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_activos.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error => {
        console.error('Error al generar el reporte:', error);
      },
    ).add(() => {
      this.router.navigate(["/mantenedores/activo-fijo-local"]);
    });
  }
}
