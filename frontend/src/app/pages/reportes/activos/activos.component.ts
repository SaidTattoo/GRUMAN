import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportesService } from '../reportes.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './activos.component.html',
  styleUrls: ['./../reportes.component.scss']
})
export class ActivosComponent implements OnInit {
  private user: any;
  private storageSubscription: Subscription;
  constructor(
    private readonly router: Router,
    private readonly reportesService: ReportesService,
    private storage: StorageService
  ) { }

  ngOnInit(): void {
    this.storageSubscription = this.storage.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    this.generarReporte();
  }

  generarReporte(): void {
    const companyId = this.user.selectedCompany.id;
    const hasGrumanCompany = this.user.selectedCompany.nombre.toLowerCase().includes('gruman');
    debugger

    this.reportesService.generarReporteExcel(hasGrumanCompany ? null : companyId).subscribe(
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
